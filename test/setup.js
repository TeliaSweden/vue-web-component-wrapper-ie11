require('@babel/polyfill')
const puppeteer = require('puppeteer')
const { createServer } = require('http-server')

// dumpio: true is helpful to get error logs from the browser
const port = 3000
const puppeteerOptions = process.env.CI
  ? { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
  : { dumpio: false }

let browser, server

module.exports = async function launchPage(name) {
  const url = `http://localhost:${port}/test/fixtures/${name}.html`
  const page = await browser.newPage()
  await page.goto(url)
  const logs = []
  page.on('console', (msg) => {
    logs.push(msg.text())
  })
  await page.goto(url)
  return { browser, page, logs }
}

beforeAll(async () => {
  browser = await puppeteer.launch(puppeteerOptions)
  server = createServer({ root: process.cwd() })
  await new Promise((resolve, reject) => {
    server.listen(port, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })
})

afterAll(async () => {
  await browser.close()
  server.close()
})
