const axios = require('axios')
const jsdom = require("jsdom")
const { JSDOM } = jsdom
const fs = require('fs')

const WIKI_URL = 'https://pathofexile.gamepedia.com'
const FATED_ITEMS_URL = 'https://pathofexile.gamepedia.com/Fated_item'

async function parseFatedItems () {
  let items = []
  let res = await axios.get(FATED_ITEMS_URL)
  const document = (new JSDOM(res.data)).window.document

  for (let item of Array.from(document.getElementsByTagName('table')[0].firstChild.children).slice(1)) {
    items.push(await parseFatedItem(item))
  }

  console.log(`${items.length} Fated Items parsed`)

  return items
}

async function parseFatedItem (item) {
    let a = item.getElementsByTagName('a')[0]
    let res = await axios.get(`${WIKI_URL}${a.getAttribute('href')}`)
    const document = (new JSDOM(res.data)).window.document
    const table = Array.from(document.getElementsByTagName('table')).filter(e => /Ingredient/.test(e.textContent))[0]
    let items = Array.from(table.getElementsByClassName('c-item-hoverbox'))
    let prophecy = null
    let base = null
    for (let i of items) {
      let name = i.getElementsByTagName('a')[0].textContent
      if (i.innerHTML.indexOf('Prophecy_inventory_icon.png') > -1) prophecy = name
      else if (base == null && name != 'Silver Coin') base = name
    }
    return `tr !{r.recipe(["${prophecy}", "${base}"], ["${a.textContent}"], true)}`
}

parseFatedItems().then(r => {
  fs.writeFileSync(__dirname + '/../public/html/fatedItems.pug', r.join('\n'))
  console.log('pug file generated')
})
