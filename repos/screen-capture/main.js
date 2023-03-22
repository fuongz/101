const fastify = require('fastify')({ logger: true })
const puppeteer = require('puppeteer')

const { S3, PutObjectCommand } = require('@aws-sdk/client-s3')
const { S3RequestPresigner } = require('@aws-sdk/s3-request-presigner')
const { HttpRequest } = require('@aws-sdk/protocol-http')
const { parseUrl } = require('@aws-sdk/url-parser')
const { Hash } = require('@aws-sdk/hash-node')
const { formatUrl } = require('@aws-sdk/util-format-url')

require('dotenv').config()

const region = process.env.AWS_DEFAULT_REGION || 'ap-southeast-1'
const bucket = process.env.AWS_BUCKET || 'cdn.phake.app'

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
}

const client = new S3({
  region,
  credentials,
})

const isInstagramPostLink = (url) => {
  if (url.includes('instagram.com/p/')) {
    return true
  }
  return false
}

const isTiktokPostLink = (url) => {
  if (url.includes('tiktok.com/')) {
    return true
  }
  return false
}

const getPostId = (url) => {
  if (isInstagramPostLink(url)) {
    return url.split('/p/')[1].split('/')[0]
  }

  if (isTiktokPostLink(url)) {
    return url.split('/video/')[1].split('/')[0]
  }

  return null
}

const getSocialNetwork = (url) => {
  if (isInstagramPostLink(url)) {
    return 'instagram'
  }

  if (isTiktokPostLink(url)) {
    return 'tiktok'
  }

  return null
}

const putFile = async (url, file) => {
  const sn = getSocialNetwork(url)
  const postId = getPostId(url)

  const params = {
    Bucket: bucket,
    Key: `${sn}/${postId}.png`,
    Body: file,
  }
  const data = await client.send(new PutObjectCommand(params))
  return data
}

const delay = (time) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  })
}

const getPresignedUrl = async (url) => {
  const sn = getSocialNetwork(url)
  const postId = getPostId(url)

  const key = `${sn}/${postId}.png`

  const s3ObjectUrl = parseUrl(`http://${bucket}.s3.${region}.amazonaws.com/${key}`)
  const presigner = new S3RequestPresigner({
    credentials,
    region,
    sha256: Hash.bind(null, 'sha256'),
  })

  const publicUrl = await presigner.presign(new HttpRequest(s3ObjectUrl))
  return formatUrl(publicUrl)
}

const screenshot = async (url, padding = 0) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()
  page.setViewport({ width: 1000, height: 600, deviceScaleFactor: 2 })

  async function screenshotDOMElement(url = null, padding = 0) {
    const sn = getSocialNetwork(url)
    let fn = () => {}

    if (sn === 'instagram') {
      await page.waitForSelector('article')
      await page.waitForSelector('._a9z6')
      selector = 'main article'
      fn = (ref) => {
        const element = document.querySelector(ref)
        const term = document.querySelector('.xoegz02')

        if (term) {
          term.remove()
        }

        const { x, y, width, height } = element.getBoundingClientRect()
        return { left: x, top: y, width, height, id: element.id }
      }
    } else if (sn === 'tiktok') {
      selector = '#app > div:nth-child(5) > div:nth-child(2) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1)'
      await page.waitForSelector(selector)
      await delay(5000)

      fn = (ref) => {
        const element = document.querySelector(ref)

        const { x, y, width, height } = element.getBoundingClientRect()
        return { left: x, top: y, width, height, id: element.id }
      }
    }

    const rect = await page.evaluate(fn, selector)
    const screenshot = await page.screenshot({
      clip: {
        x: rect.left - padding,
        y: rect.top - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      },
    })

    await putFile(url, screenshot)
    return screenshot
  }

  await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await screenshotDOMElement(url, padding)
  await browser.close()
}

// Declare a route
fastify.post('/screenshot', async (request, reply) => {
  const { url, padding } = request.body

  await screenshot(url, padding || 0)
  const publicUrl = await getPresignedUrl(url)
  return reply.send({ url, screenshot_url: publicUrl })
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen({ port: 3000 })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
