const express = require('express')
const app = express()
const port = 3000

const pug = require('pug')


// For leagues list http://api.pathofexile.com/leagues (care to remove SSF)
const LEAGUES_NAMES = {
  'challenge': 'Harvest',
  'challengehc': 'Hardcore Harvest',
  'standard': 'Standard',
  'hardcore': 'Hardcore'
}
const LEAGUES_ALIAS = ['challenge', 'challengehc', 'standard', 'hardcore']
const FETCH_INTERVAL = 10 * 60 * 1000

const Trade = require('./src/trade.js')
let trade = new Trade('searches.json')

const Render = require('./src/render.js')
let renders = {}
for (let league of LEAGUES_ALIAS) {
  renders[league] = new Render(LEAGUES_NAMES[league], trade)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

let init = false

async function fetchPrice () {
  for (let league of LEAGUES_ALIAS) {
    await renders[league].fetchPrice()
    console.log(`Prices fetched for ${league}`)
  }

  init = true

  /*for (let name in renders[LEAGUES_ALIAS[0]].prices) {
    let res = await trade.makeLink(name)
    while (res == 429) {
      console.log('Too many request, sleep for 10 sec')
      await sleep(10000)
      res = await trade.makeLink(name)
    }
  }
  console.log('Trade links made')*/

  setTimeout(fetchPrice, FETCH_INTERVAL)
}
fetchPrice()

app.use(express.static('public'))
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.redirect('/challenge')
})

app.get('/:league', (req, res) => {
  if (LEAGUES_ALIAS.includes(req.params.league)) {
    if (init) res.render(__dirname + '/public/html/index.pug', { r: renders[req.params.league], league: req.params.league, fetchInterval: FETCH_INTERVAL })
    else res.render(__dirname + '/public/html/not_ready.pug')
  } else {
    res.redirect('/challenge')
  }
})

app.get('/trade/:league', (req, res) => {
  let query = {}
  if (req.query.name) query['name'] = req.query.name
  if (req.query.type) query['type'] = req.query.type
  trade.getLink(query, req.params.league).then(link => {
    res.redirect(link)
  }).catch(error => {
    //if (!error.response || error.response.status != 429) console.error(error)
    res.render(__dirname + '/public/html/trade_error.pug')
  })
})

app.listen(port, () => {
  console.log(`worth-poe running on http://localhost:${port}`)
})
