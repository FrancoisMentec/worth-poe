const price = require('./price.js')

class Render {
  constructor (league='challenge', trade=null) {
    this.prices = null
    this.league = league
    this.trade = trade
  }

  get ready () {
    return this.prices != null
  }

  round (value) {
    return Math.round(value * 100) / 100
  }

  encodeModifiers (modifiers) {
    return modifiers.map(m => m.text.replace(/\n/g, '<br>')).join('<sep>')
  }

  encodeFlavour (flavour) {
    if (typeof flavour !== 'string') return ''
    let res = flavour.replace(/"/g, '&#x22;')
    res = res.replace(/\n/g, '<br>')
    res = res.replace(/{|}/g, '')
    res = res.replace(/<\/?size[^>]*>/g, '')
    return res
  }

  async fetchPrice () {
    try {
      this.prices = await price.getAllPrices(this.league)
    } catch (error) {
      console.error(`An error occured while fetching price for ${this.league}:`)
      console.error(error)
    }
  }

  tradeLink (name) {
    let res = `/trade/${this.league}`
    if ([5, 6].includes(this.prices[name].itemClass)) res += `?type=${encodeURIComponent(name)}`
    else res += `?name=${encodeURIComponent(name)}`
    return res
  }

  item (name, type=null) {
    if (typeof this.prices[name] == 'undefined') return `<div class="item">Item missing: ${name}</div>`
    let item = this.prices[name]
    return `<td value="${item.chaosValue}">
    <a class="item", href="${this.tradeLink(name)}" target="_blank" name="${name}" itemClass="${item.itemClass}" stackSize="${item.stackSize}" artFilename="${item.artFilename}" flavourText="${this.encodeFlavour(item.flavourText)}" explicitModifiers="${this.encodeModifiers(item.explicitModifiers)}">
        <div class="name">
          <img src="${item.icon}"> ${name}
        </div>
        <div class="price">
          ${this.round(item.chaosValue)}
        </div>
      </a></td>`
  }

  profit (composants, results) {
    let cost = composants.map(i => this.prices[i].chaosValue).reduce((a, b) => a + b, 0)
    let turnover = results.map(i => this.prices[i].chaosValue).reduce((a, b) => a + b, 0)
    return `<div class="price">
      ${this.round(turnover - cost)}
    </div>`
  }

  recipe (composants, results, includeCost=false) {
    let res = ''
    let cost = 0
    let itemMissing = false
    for (let item of composants) {
      res += this.item(item)
      if (this.prices[item]) cost += this.prices[item].chaosValue
      else itemMissing = true
    }
    if (includeCost) {
      res += !itemMissing
        ? `<td class="price" value="${cost}">${this.round(cost)}</td>`
        : '<td class="price">-</td>'
    }
    let turnover = 0
    for (let item of results) {
      res += this.item(item)
      if (this.prices[item]) turnover += this.prices[item].chaosValue
      else itemMissing = true
    }
    res += !itemMissing
      ? `<td class="price" value="${turnover - cost}">${this.round(turnover - cost)}</td>`
      : '<td class="price">-</td>'
    return res
  }

  divination (name) {
    let stack = typeof this.prices[name] !== 'undefined'
      ? this.prices[name].stackSize
      : null
    let price = stack != null
      ? this.prices[name].chaosValue * stack
      : null
    let res = this.item(name, 'divination')
    res += stack != null
      ? `<td class="right" value="${stack}">${stack}</td>`
      : `<td class="right">-</td>`
    res += stack != null
      ? `<td class="price" value="${price}">${stack != null ? this.round(price) : '-'}</td>`
      : `<td class="price">-</td>`
    return res
  }
}

module.exports = Render
