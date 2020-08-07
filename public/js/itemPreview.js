let items = document.getElementsByClassName('item')

let textColorRegex = /<(gemitem|default|currencyitem|normal|whiteitem|augmented|magic|magicitem|rare|rareitem|unique|uniqueitem|corrupted|prophecy)>{([^}]+)}/gm

function parseDivinationReward (reward) {
  let res = reward //.replace(/<br>/g, '\n')
  res = res.replace(/<size:\d+>/gm, '')
  while (textColorRegex.test(res)) res = res.replace(textColorRegex, '<span class="text-color $1">$2</span>')
  return res.replace(/{|}/g, '')
}

for (let item of items) {
  if (item.getAttribute('itemClass') == 6) { // Divination card
    let itemPreview = null
    item.addEventListener('mouseover', e => {
      if (itemPreview == null) {
        itemPreview = document.createElement('div')
        itemPreview.className = 'divination'
        itemPreview.innerHTML = `
        <img class="art" src="https://web.poecdn.com/image/divination-card/${item.getAttribute('artFilename')}.png">
        <div class="content">
          <img class="frame" src="/img/divination_card_frame.png">
          <div class="name">${item.getAttribute('name')}</div>
          <div class="stack">${item.getAttribute('stackSize')}</div>
          <div class="reward"><span>${parseDivinationReward(item.getAttribute('explicitModifiers'))}</span></div>
          <div class="flavour"><span>${item.getAttribute('flavourText')}</span></div>
        </div>`
      }
      /*itemPreview.style.left = Math.min(e.pageX + 16, document.body.clientWidth - 456)
      itemPreview.style.top = Math.min(e.clientY - 52, document.body.clientHeight - 684)*/
      document.body.appendChild(itemPreview)
    })
    item.addEventListener('mouseout', e => {
      if (itemPreview.parentNode) itemPreview.parentNode.removeChild(itemPreview)
    })
  }
}
