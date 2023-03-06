// D key for quick-creation
window.addEventListener('keydown', ev => {
  if (ev.code === 'KeyD' && ev.metaKey) {
    document
      .querySelector(
        '.notion-sidebar .notion-scroller.vertical + * .notion-focusable[role="button"][tabindex="0"]'
      )
      .click()
  }
})

const updateCustomCSS = async () => {
  const { customCSS } = await window.chrome.storage.sync.get('customCSS')
  if (customCSS) {
    document.body.classList.add('custom-css')
  } else {
    document.body.classList.remove('custom-css')
  }
}

updateCustomCSS()
window.chrome.storage.sync.onChanged.addListener(changes => {
  if (changes.customCSS) {
    updateCustomCSS()
  }
})
