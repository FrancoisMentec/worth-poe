import axios from 'axios'
import jsdom from 'jsdom'
const { JSDOM } = jsdom
import fs from 'fs'

const DIVINATION_URL = 'https://pathofexile.gamepedia.com/List_of_divination_cards'

const HEADER = `h3#div4$link$ Divination for $category$
table
  thead
    tr
      th Card
      th.right Number
      th.price Cost
  tbody
`

let filters = {
  'Corrupted Gem': html => /class="text-color -gem".*corrupted/i.test(html),
  'Essence': html => /href="\/Essence"/.test(html),
  'Gem': html => /class="text-color -gem"/.test(html),
  'Influenced Item': html => /href="\/Influenced_item"/.test(html),
  'Jewel': html => /jewel\W/i.test(html),
  'Scarab': html => /scarab/i.test(html),
  'Six-Linked Item': html => /six-link|Tabula Rasa|Charan's Sword/i.test(html),
  'Two-Implicit Unique Item': html => /class="text-color -unique".*two-implicit/i.test(html),
  'Unique Item': html => /class="text-color -unique"/.test(html)
}

async function parseDivination () {
  let categories = {}
  for (let i in filters) {
    categories[i] = []
  }
  let res = await axios.get(DIVINATION_URL)
  const document = (new JSDOM(res.data)).window.document

  for (let divi of Array.from(document.getElementsByTagName('table')[0].firstChild.children).slice(1)) {
    let name = divi.firstChild.firstChild.firstChild.children[1].innerHTML
    let html = divi.children[2].innerHTML
    for (let filter in filters) {
      if (filters[filter](html)) {
        categories[filter].push(name)
      }
    }
  }

  let pug = ''

  for (let category in categories) {
    pug += HEADER.replace('$category$', category).replace('$link$', category.replace(/\ /g, '_'))
    for (let divi of categories[category]) {
      pug += `    tr !{r.divination("${divi}")}\n`
    }
    pug += '\n\n'
  }

  fs.writeFileSync('../public/html/div4item.pug', pug)
  console.log('pug file generated')
}

parseDivination()
