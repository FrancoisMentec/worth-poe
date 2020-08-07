const https = require('https')

function getPriceFromNinja (url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const { statusCode } = res
      const contentType = res.headers['content-type']

      let error
      if (statusCode !== 200) {
        error = new Error(`Request Failed.\nStatus Code: ${statusCode}`)
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error(`Invalid content-type.\nExpected application/json but received ${contentType}`)
      }
      if (error) {
        console.error(error.message)
        res.resume()
        reject(error)
      }

      res.setEncoding('utf8');
      let rawData = ''
      res.on('data', (chunk) => { rawData += chunk })
      res.on('end', () => {
        try {
          const data = JSON.parse(rawData)
          let items = {}
          for (let item of data.lines) {
            items[item.name] = item
          }
          resolve(items)
        } catch (error) {
          console.error(error.message)
          reject(error)
        }
      })
    })
  })
}

module.exports.getAllPrices = async function (league='challenge') {
  const urls = [
    `https://poe.ninja/api/data/itemoverview?league=${encodeURIComponent(league)}&type=Vial&language=en`,
    `https://poe.ninja/api/data/itemoverview?league=${encodeURIComponent(league)}&type=UniqueArmour&language=en`,
    `https://poe.ninja/api/data/itemoverview?league=${encodeURIComponent(league)}&type=UniqueAccessory&language=en`,
    `https://poe.ninja/api/data/itemoverview?league=${encodeURIComponent(league)}&type=UniqueWeapon&language=en`,
    `https://poe.ninja/api/data/itemoverview?league=${encodeURIComponent(league)}&type=UniqueFlask&language=en`,
    `https://poe.ninja/api/data/itemoverview?league=${encodeURIComponent(league)}&type=UniqueJewel&language=en`,
    `https://poe.ninja/api/data/itemoverview?league=${encodeURIComponent(league)}&type=DivinationCard&language=en`,
    `https://poe.ninja/api/data/itemoverview?league=${encodeURIComponent(league)}&type=Prophecy&language=en`
  ]
  let items = {}
  for (let url of urls) {
    try {
      let data = await getPriceFromNinja(url)
      for (let item in data) {
        if (typeof items[item] !== 'undefined') {
          if (items[item].itemClass == data[item].itemClass) {
            throw new Error(`Got two items with the same name (${item}) and the same item class (${data[item].itemClass})`)
          } else {
            let temp = {}
            Object.assign(temp, items[item])
            items[item] = {}
            items[item][items[item].itemClass] = temp
            items[item][data[item].itemClass] = data[item]
          }
        } else items[item] = data[item]
      }
    } catch (error) {
      console.error(`Error trying to fetch url ${url}:`)
      console.error(error)
    }
  }
  return items
}
