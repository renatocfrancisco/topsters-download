import fs from 'fs'
import puppeteer from 'puppeteer'
import { inputUsername, confirmPeriod, confirmSize, inputRows, inputColumns, inputPadding, confirmAlbumTitles, confirmNumbered } from './js/inquirerInputs.js'
import selectors from './js/selectors.js'
import { options } from './js/puppeteerOptions.js'

async function delay (ms = 1000) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

(async () => {
  let json = {}

  if (fs.existsSync('options.json')) {
    const options = fs.readFileSync('options.json')
    json = JSON.parse(options)
  }

  const yArgument = ['-y'].includes(process.argv[2])
  const emptyJson = !Object.keys(json).length

  if (yArgument && emptyJson) {
    console.log('Not possible to execute option "-y" without a options.json')
    process.exit()
  }

  if (yArgument && !emptyJson) {
    await downloadTopstersImage(json)
  } else {
    const data = {}

    data.username = await inputUsername(json)
    data.period = await confirmPeriod(json)
    data.size = await confirmSize(json)

    if (data.size === '25') {
      data.rows = await inputRows(json)
      data.columns = await inputColumns(json)
    }

    data.gap = await inputPadding(json)
    data.albumTitles = await confirmAlbumTitles(json)
    if (data.albumTitles) {
      data.numbered = await confirmNumbered()
    }

    const jsonData = JSON.stringify(data)
    fs.writeFileSync('options.json', jsonData, 'utf-8')

    await downloadTopstersImage(data)
  }

  async function downloadTopstersImage (data) {
    const browser = await puppeteer.launch(options)

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
    page.on('dialog', async (dialog) => {
      await dialog.accept()
    })
    await delay()
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

    async function manipulateSliderInput (selector) {
      const max = await page.$eval(selector, (input) => parseInt(input.max))
      const value = await page.$eval(selector, (input) => parseInt(input.value))
      await page.focus(selector)
      if (value === max) {
        await page.keyboard.press('ArrowLeft')
        await page.keyboard.press('ArrowRight')
      } else {
        await page.keyboard.press('ArrowRight')
        await page.keyboard.press('ArrowLeft')
      }
    }

    await page.$eval(selectors.widthInput, (element, value) => {
      element.value = value
    }, data.columns).then(() => manipulateSliderInput(selectors.widthInput))

    if (data.size === '25') {
      await page.$eval(selectors.heightInput, (element, value) => {
        element.value = value
      }, data.rows).then(() => manipulateSliderInput(selectors.heightInput))

      await page.$eval(selectors.gapInput, (element, value) => {
        element.value = value
      }, data.gap).then(() => manipulateSliderInput(selectors.gapInput))
    }

    if (!data.albumTitles) {
      await page.click(selectors.titlesCheck)
    } else {
      if (data.numbered) {
        await page.click(selectors.numbersCheck)
      }
    }

    await page.click(selectors.downloadButton)
    await delay(20000)

    await browser.close()
    process.exit()
  }
})()
