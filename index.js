import axios from 'axios'
import express from 'express'
const app = express()
const port = 3000

import pug from 'pug'

import Trade from './src/trade.js'
let trade = new Trade('searches.json')

import Render from './src/render.js'
let renders = {}
let pages = {}

const FETCH_INTERVAL = 10 * 60 * 1000 // Interval in ms at which price are fetched

const ENV = process.argv.indexOf('-d')
  ? 'dev'
  : 'prod'
console.log(`Environement: ${ENV}`)

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

let init = false

async function fetchPrice () {
  for (let league of LEAGUES_ALIAS) {
    renders[league].fetchPrice().then(() => {
      pages[league] = pug.renderFile('./public/html/index.pug', {
        r: renders[league],
        league: league,
        fetchInterval: FETCH_INTERVAL
      })
      console.log(`Prices fetched for ${league}`)
    })
  }

  init = true

  setTimeout(fetchPrice, FETCH_INTERVAL)
}

const LEAGUES_ALIAS = ['challenge', 'challengehc', 'standard', 'hardcore']
let leaguesNames = null

/*axios.get('https://api.pathofexile.com/leagues').then(res => {
  leaguesNames = {
    'standard': res.data[0].id,
    'hardcore': res.data[1].id,
    'challenge': res.data[4].id,
    'challengehc': res.data[5].id
  }

  console.log('Leagues names fetched')

  for (let league of LEAGUES_ALIAS) {
    renders[league] = new Render(leaguesNames[league], trade)
  }

  fetchPrice()
}).catch(error => {
  console.error(`Failed to fetch leagues names: ${error.code}`)
  process.exit(1)
})*/

leaguesNames = {
  standard: 'Standard',
  hardcore: 'Hardcore',
  challenge: 'Crucible',
  challengehc: 'Hardcore+Crucible'
}

for (let league of LEAGUES_ALIAS) {
  renders[league] = new Render(leaguesNames[league], trade)
}

fetchPrice()

app.use(express.static('public'))
app.set('views', './public/html')
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.redirect('/challenge')
})

app.get('/:league', (req, res) => {
  if (LEAGUES_ALIAS.includes(req.params.league)) {
    if (typeof pages[req.params.league] !== 'undefined') {
      if (ENV == 'prod') {
        res.send(pages[req.params.league])
      } else if (ENV == 'dev') {
        res.render('index.pug', {
          r: renders[req.params.league],
          league: req.params.league,
          fetchInterval: FETCH_INTERVAL
        })
      }
    } else res.render('not_ready.pug')
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
    res.render('trade_error.pug')
  })
})

app.listen(port, () => {
  console.log(`worth-poe running on http://localhost:${port}`)
})
