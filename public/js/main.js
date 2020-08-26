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

let urlParams = new URLSearchParams(window.location.search)
if (urlParams.get('search') != null) {
  search(urlParams.get('search'))
}
