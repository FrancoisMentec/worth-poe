const axios = require('axios')
const fs = require('fs')

class Trade {
  constructor (path=null) {
    this.path = path
    this.searches = {}
    if (path != null) this.load(path)
  }

  async makeLink (query) {
    if (typeof this.searches[query.name || query.type] === 'undefined') {
      query.status = {option: "online"}
      query.stats = [{type: "and", filters: []}]
      try {
        let res = await axios.post(`https://www.pathofexile.com/api/trade/search/Standard`, {
          query: query,
          sort: {
            price: "asc"
          }
        })
        this.searches[query.name || query.type] = `https://www.pathofexile.com/trade/search/{league}/${res.data.id}`
        if (this.path != null) this.save(this.path)
      } catch (error) {
        console.log(query)
        if (!error.response || error.response.status != 429) {
          console.error(`Error while trying to make trade link for ${query.name || query.type}`)
          if (error.response) console.error(`Code: ${error.response.status} ${error.response.statusText}`)
          else {
            //console.error(error)
          }
        }
        throw error
      }
    }
    return
  }

  getLinkSync (name, league) {
    if (typeof this.searches[name] === 'undefined') throw new Error(`Search link for ${name} doesn't exists, you need to use makeLink(name) first`)
    else return this.searches[name].replace('{league}', league)
  }

  async getLink (query, league) {
    try {
      if (typeof this.searches[query.name || query.type] === 'undefined') await this.makeLink(query)
      return this.searches[query.name || query.type].replace('{league}', league)
    } catch (error) {
      throw error
    }
  }

  save (path) {
    return new Promise ((resolve, reject) => {
      fs.writeFile(path, JSON.stringify(this.searches), (error) => {
        if (error) reject(error)
        else resolve()
      })
    })
  }

  async load (path) {
    if (fs.existsSync(path)) {
      let data = fs.readFileSync(path)
      this.searches = JSON.parse(data.toString())
      console.log(`Searches loaded from ${path}`)
    }
  }
}

module.exports = Trade
