const price = require('./price.js')

const DIVINATION = 6
const PROPHECY = 8

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
    if (!Array.isArray(modifiers)) return ''
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

  getItem (name, itemClass=null) {
    let i = this.prices[name]
    if (Array.isArray(i)) {
      if (itemClass != null) {
        i = i.filter(v => v.itemClass == itemClass)
        if (i.length <= 0) throw new Error(`No item named ${name} of class ${itemClass}`)
        else if (i.length > 1) throw new Error(`Multiple items named ${name} of class ${itemClass}`)
        else return i[0]
      } else {
        throw new Error(`Multiple items named: ${name}, you should had more filters`)
      }
    } else return i
  }

  async fetchPrice () {
    try {
      this.prices = await price.getAllPrices(this.league)
    } catch (error) {
      console.error(`An error occured while fetching price for ${this.league}:`)
      console.error(error)
    }
  }

  tradeLink (name, itemClass=null) {
    let res = `/trade/${this.league}`
    if ([5, 6].includes(this.getItem(name, itemClass=itemClass).itemClass)) res += `?type=${encodeURIComponent(name)}`
    else res += `?name=${encodeURIComponent(name)}`
    return res
  }

  item (name, itemClass=null) {
    let item = this.getItem(name, itemClass)
    if (typeof item == 'undefined') return `<td><div class="item">Item missing: ${name}</div></td>`
    return `<td value="${item.chaosValue}">
    <a class="item", href="${this.tradeLink(name, itemClass)}" target="_blank" name="${name}" itemClass="${item.itemClass}" stackSize="${Math.max(item.stackSize, 1)}" artFilename="${item.artFilename}" flavourText="${this.encodeFlavour(item.flavourText)}" explicitModifiers="${this.encodeModifiers(item.explicitModifiers)}">
        <div class="name">
          <img src="${item.icon}"> ${name}
        </div>
        <div class="price">
          ${this.round(item.chaosValue)}
        </div>
      </a></td>`
  }

  profit (composants, results) {
    let cost = composants.map(i => this.getItem(i).chaosValue).reduce((a, b) => a + b, 0)
    let turnover = results.map(i => this.getItem(i).chaosValue).reduce((a, b) => a + b, 0)
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
      if (this.getItem(item)) cost += this.getItem(item).chaosValue
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
      if (this.getItem(item)) turnover += this.getItem(item).chaosValue
      else itemMissing = true
    }
    res += !itemMissing
      ? `<td class="price" value="${turnover - cost}">${this.round(turnover - cost)}</td>`
      : '<td class="price">-</td>'
    return res
  }

  divination (name) {
    let item = this.getItem(name, DIVINATION)
    let stack = typeof item !== 'undefined'
      ? Math.max(item.stackSize, 1)
      : null
    let price = stack != null
      ? item.chaosValue * stack
      : null
    let res = this.item(name, DIVINATION)
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
