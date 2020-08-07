function getValue (element, defaultValue=Number.NEGATIVE_INFINITY) {
  return element.hasAttribute('value')
    ? parseFloat(element.getAttribute('value'))
    : defaultValue
}

function sortTable (table, index, reverse=false) {
  let defaultValue = reverse
    ? Number.POSITIVE_INFINITY
    : Number.NEGATIVE_INFINITY
  let switching = true
  while (switching) {
    // Start by saying: no switching is done:
    switching = false
    let rows = table.rows
    let shouldSwitch
    /* Loop through all table rows (except the
    first, which contains table headers): */
    for (i = 1; i < (rows.length - 1); i++) {
      // Start by saying there should be no switching:
      shouldSwitch = false
      /* Get the two elements you want to compare,
      one from current row and one from the next: */

      x = getValue(rows[i].getElementsByTagName("TD")[index], defaultValue)
      y = getValue(rows[i + 1].getElementsByTagName("TD")[index], defaultValue)

      // Check if the two rows should switch place:
      if ((!reverse && x < y) || (reverse && x > y)) {
        // If so, mark as a switch and break the loop:
        shouldSwitch = true
        break
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i])
      switching = true
    }
  }
}

document.addEventListener('click', e => {
  let elt = e.srcElement
  if (elt.tagName == 'TH') {
    for (let child of elt.parentNode.children) {
      if (child != elt) child.setAttribute('sort', '')
    }
    let sort = elt.hasAttribute('sort')
      ? elt.getAttribute('sort') == 'ascend' ? 'descend' : 'ascend'
      : 'ascend'
    sortTable(elt.parentNode.parentNode.parentNode, elt.cellIndex, sort == 'ascend')
    elt.setAttribute('sort', sort)
  }
})

function sortAllTable () {
  for (let table of document.getElementsByTagName('table')) {
    let elt = Array.from(table.getElementsByTagName('th')).slice(-1)[0]
    let sort = elt.hasAttribute('sort')
      ? elt.getAttribute('sort')
      : /Profit/.test(elt.textContent)
        ? 'descend'
        : 'ascend'
    sortTable(table, table.rows[0].children.length - 1, sort == 'ascend')
    elt.setAttribute('sort', sort)
  }
}

sortAllTable()

let content = document.getElementById('content')
function search (query) {
  if (query.length > 0) {
    let regExp = new RegExp(query, 'i')
    let visibleLevel = Number.POSITIVE_INFINITY
    let i = 0
    for (let child of content.children) {
      if (i <= 1) child.style.display = 'none'
      else {
        let match = regExp.test(child.textContent)
        if (/H\d/.test(child.tagName)) {
          let level = parseInt(child.tagName[1])
          if (match) visibleLevel = Math.min(visibleLevel, level)
          else if (level <= visibleLevel) visibleLevel = Number.POSITIVE_INFINITY
        }
        child.style.display = match || visibleLevel < Number.POSITIVE_INFINITY
          ? ''
          : 'none'
      }
      i++
    }
  } else {
    for (let child of content.children) {
      child.style.display = ''
    }
  }
}

document.getElementById('search').addEventListener('input', e => {
  search(e.srcElement.value)
  if (e.srcElement.value.length > 0) window.history.replaceState({},"", '?search=' + encodeURIComponent(e.srcElement.value))
  else window.history.replaceState({},"", location.pathname)
})
