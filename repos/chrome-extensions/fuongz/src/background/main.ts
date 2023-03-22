// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

// Check is valid pattern
const isValidPattern = (urlPattern: string) => {
  const validPattern = /^(file:\/\/.+)|(https?|ftp|\*):\/\/(\*|\*\.([^\/*]+)|([^\/*]+))\//g
  return !!urlPattern.match(validPattern)
}

// Get blocked urls from gist
const getBlockedUrls = async () => {
  const getGist = await fetch('https://api.github.com/gists/b4fcebfa9bf2cb906443505ff1116487')

  if (getGist.ok) {
    const rawGist: any = await getGist.json().then((gist: any) => fetch(gist.files['fugon11-chrome-extension-config.json'].raw_url).then((res: any) => res.json()))
    if (rawGist) {
      window.localStorage.setItem('fuongz-chrome-extension-config', JSON.stringify(rawGist))
      window.localStorage.setItem('fuongz-chrome-extension-config', JSON.stringify(Date.now()))
      return rawGist.blocked_urls.filter(isValidPattern)
    }
    return []
  }

  return []
}

// Logging block requests
const blockRequest = (details: any) => {
  console.log('[fuongz] blocked: ', details.url)
  return {
    cancel: true,
  }
}

// Main function
const load = async () => {
  const blockedUrls = await getBlockedUrls()

  if (browser.webRequest.onBeforeRequest.hasListener(blockRequest)) browser.webRequest.onBeforeRequest.removeListener(blockRequest)

  try {
    browser.webRequest.onBeforeRequest.addListener(blockRequest, { urls: [...blockedUrls] }, ['blocking'])
  } catch (e) {
    console.error('[fuongz] errors: ', e)
  }
}

load().then(() => {
  console.log('[fuongz] ads blocked loaded.')
})
