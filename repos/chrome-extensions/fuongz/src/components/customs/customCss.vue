<script setup lang="ts">
const $style = document.createElement('style')

const setCustomCss = (data: any[]) => {
  const siteConfig = data.find((site: any) => site.domains.includes(window.location.hostname))

  if (siteConfig && siteConfig?.readOnly !== true) {
    const $head = document.head || document.getElementsByTagName('head')[0]
    const $body = document.body || document.getElementsByTagName('body')[0]

    $body.classList.add('fugon-voz')
    $style.appendChild(document.createTextNode(siteConfig?.css))
    $head.appendChild($style)
  }

  if (siteConfig?.readOnly) {
    const $head = document.head || document.getElementsByTagName('head')[0]
    const $body = document.body || document.getElementsByTagName('body')[0]

    $body.classList.add('fugon-voz-read-only')
    $style.appendChild(document.createTextNode(siteConfig?.readOnlyCss))
    $head.appendChild($style)
  }
}

const getCss = async () => {
  const getGist = await fetch('https://api.github.com/gists/eb9fa838e1a1d7fd0608a3473f26c9bd')

  if (getGist.ok) {
    const rawGist: any[] = await getGist.json().then((gist: any) => fetch(gist.files['fugon-chrome-extension-config.json'].raw_url).then((res: any) => res.json()))
    if (rawGist && Array.isArray(rawGist)) {
      window.localStorage.setItem('fugon-custom-sites', JSON.stringify(rawGist))
      window.localStorage.setItem('fugon-custom-sites-refresh-time', JSON.stringify(Date.now()))
      setCustomCss(rawGist)
    }
  }
}

onBeforeMount(async () => {
  const customSites = window.localStorage.getItem('fugon-custom-sites')
  const customSitesRefreshTime = window.localStorage.getItem('fugon-custom-sites-refresh-time')
  const sites = customSites ? JSON.parse(customSites) : []
  if (sites.length) setCustomCss(sites)
  else await getCss()

  if (customSitesRefreshTime) {
    const refreshTime = JSON.parse(customSitesRefreshTime)
    const now = Date.now()
    if (now - refreshTime > 1000 * 60 * 60 * 24) await getCss()
  } else {
    await getCss()
  }
})
</script>

<template>
  <div />
</template>
