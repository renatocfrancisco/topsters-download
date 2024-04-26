import fs from 'fs'
import puppeteer from 'puppeteer'
import { inputUsername, confirmPeriod, confirmSize, inputRows, inputColumns, inputPadding, confirmAlbumTitles, confirmNumbered } from './js/inquirerInputs.js'
import selectors from './js/selectors.js'

(async () => {
  let json = {}

  // if (fs.existsSync('options.json')) {
  //   const options = fs.readFileSync('options.json')
  //   json = JSON.parse(options)
  // }

  if (['-y'].includes(process.argv[2]) && !json) {
    console.log('Not possible to execute option "-y" without a options.json')
    process.exit()
  }

  if (['-y'].includes(process.argv[2]) && json) {
    await downloadTopstersImage(json)
  } else {
    // const rows = 6
    // const columns = 6

    // const username = await inputUsername(json)
    // const period = await confirmPeriod(json)
    // const size = await confirmSize(json)

    // // if (size === '25') {
    // //   rows = await inputRows(json)
    // //   columns = await inputColumns(json)
    // // }

    // const padding = await inputPadding(json)
    // const albumTitles = await confirmAlbumTitles(json)
    // // if (albumTitles) {
    // //   const numbered = await confirmNumbered(json)
    // // }

    const data = {
      username: 'renatocfrancisc',
      rows: 5,
      columns: 5,
      padding: 6,
      period: '7day',
      albumTitles: false
    }
    // const jsonData = JSON.stringify(data)
    // fs.writeFileSync('options.json', jsonData, 'utf-8')

    await downloadTopstersImage(data)
  }

  async function downloadTopstersImage (data) {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--no-sandbox', '--start-maximized']
    })

    const page = await browser.newPage()
    const urlTopsters = 'https://topsters.org/'
    await page.goto(urlTopsters, {
      waitUntil: 'networkidle2'
    }).catch(error => {
      throw new Error('Website not loaded: ', error)
    })

    await Promise.all([
      page.waitForSelector(selectors.importTab),
      page.click(selectors.importTab)
    ])
    await page.type(selectors.usernameInput, data.username, { delay: 50 })
    await page.select(selectors.periodSelect, data.period)
    await page.click(selectors.importButton)

    await page.click(selectors.optionsTab)

    async function cleanTextInput (selector) {
      await page.click(selector)
      await page.keyboard.down('Control')
      await page.keyboard.press('A')
      await page.keyboard.up('Control')
      await page.keyboard.press('Backspace')
    }

    await page.waitForSelector(selectors.titleInput)
    await cleanTextInput(selectors.titleInput)

    if (data.albumTitles) {
      await page.click(selectors.titlesCheck)
    }

    async function manipulateInput (selector) {
      const value = await page.$eval(selector, (input) => parseInt(input.max))
      const maxValue = await page.$eval(selector, (input) => parseInt(input.value))
      if (value === maxValue) {
        await page.keyboard.press('ArrowLeft')
        await page.keyboard.press('ArrowRight')
      } else {
        await page.keyboard.press('ArrowRight')
        await page.keyboard.press('ArrowLeft')
      }
    }

    await page.$eval(selectors.widthInput, (element, value) => {
      element.value = value
    }, String(data.columns)).then(() => manipulateInput(selectors.widthInput))

    await page.$eval(selectors.heightInput, (element, value) => {
      element.value = value
    }, String(data.rows)).then(() => manipulateInput(selectors.heightInput))

    await page.$eval(selectors.gapInput, (element, value) => {
      element.value = value
    }, data.gap).then(() => manipulateInput(selectors.gapInput))

    await page.click(selectors.downloadButton)
    await delay(15000)

    await browser.close()
    process.exit()
  }

  async function delay (ms) {
    await new Promise((resolve) => setTimeout(resolve, ms))
  }
})()
