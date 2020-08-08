function getValue (element, defaultValue=Number.NEGATIVE_INFINITY) {
  return element.hasAttribute('value')
    ? parseFloat(element.getAttribute('value'))
    : defaultValue
}

function sortTable (table, index, reverse=false) {
  let defaultValue = reverse
    ? Number.POSITIVE_INFINITY
    : Number.NEGATIVE_INFINITY

  let rows = Array.from(table.rows).slice(1)
  rows.sort((a, b) => {
    return reverse
      ? getValue(a.cells[index], defaultValue) - getValue(b.cells[index], defaultValue)
      : getValue(b.cells[index], defaultValue) - getValue(a.cells[index], defaultValue)
  })

  let tbody = table.tBodies[0]
  while (tbody.firstChild) tbody.removeChild(tbody.firstChild)
  for (let row of rows) {
    tbody.appendChild(row)
  }
}

Array.from(document.getElementsByTagName('th')).forEach(element => {
  element.addEventListener('click', e => {
    for (let child of element.parentNode.children) {
      if (child != element) child.setAttribute('sort', '')
    }

    let sort = element.hasAttribute('sort')
      ? element.getAttribute('sort') == 'ascend' ? 'descend' : 'ascend'
      : 'ascend'

    sortTable(element.parentNode.parentNode.parentNode, element.cellIndex, sort == 'ascend')
    element.setAttribute('sort', sort)
  })
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
