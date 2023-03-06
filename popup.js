$('#google').on('click', ev => {
  chrome.identity.getAuthToken({ interactive: true })
})

$('#notion').on('click', ev => {
  chrome.identity.launchWebAuthFlow(
    {
      url: 'https://api.notion.com/v1/oauth/authorize?client_id=096818fc-b9f3-4cf5-97f5-2554a97d97a9&response_type=code&owner=user&redirect_uri=https://hahgpoibcnamhkofphkaibhjcfogbkbl.chromiumapp.org',
      interactive: true
    },
    async url => {
      const params = new URLSearchParams(url.slice(url.indexOf('?')))
      const code = params.get('code')
      console.log('got code:', url)
      if (code) {
        // pass the code to the extension host
        const { notion_tokens } = await window.chrome.runtime.sendMessage({
          type: 'auth',
          action: 'notion.getToken',
          data: {
            code
          }
        })
        console.log('GOT TOKENS:', notion_tokens)
        chrome.storage.sync.set({
          notion_tokens,
          notion_views: {},
          ignored_calendars: []
        })
      }
    }
  )
})

const updateCustomCSS = async () => {
  const { customCSS } = await chrome.storage.sync.get('customCSS')
  if (customCSS) {
    $('#custom-css').addClass('css-enabled')
    $('#custom-css').text('On')
  } else {
    $('#custom-css').removeClass('css-enabled')
    $('#custom-css').text('Off')
  }
}

$('#custom-css').on('click', async ev => {
  let { customCSS } = await chrome.storage.sync.get('customCSS')
  customCSS = !customCSS
  await window.chrome.storage.sync.set({
    customCSS
  })
  updateCustomCSS()
})

let ignored_calendars, calendars

const getCalendars = async () => {
  $('#calendars').html('')
  calendars = (
    await chrome.runtime.sendMessage({
      type: 'google',
      action: 'calendarList.list',
      data: {
        fields: 'items(id,primary,summary)'
      }
    })
  ).items
  ignored_calendars =
    (await chrome.storage.sync.get('ignored_calendars')).ignored_calendars || []
  setCalendars()
}

const setCalendars = () => {
  $('#calendars').html('')
  for (let calendar of calendars) {
    const div = $(
      `<div class="${
        ignored_calendars.includes(calendar.id) ? 'ignored_calendar' : ''
      } calendar">${calendar.summary}</div>`
    )
    div.on('click', async () => {
      // save new calendar to settings
      if (ignored_calendars.includes(calendar.id)) {
        ignored_calendars.splice(calendars.indexOf(calendar.id, 1))
      } else {
        ignored_calendars.push(calendar.id)
      }
      chrome.storage.sync.set({ ignored_calendars })
      setCalendars()
    })
    $('#calendars').append(div)
  }
}

const setup = async () => {
  getCalendars()
  updateCustomCSS()
}

const updateView = () => {}
