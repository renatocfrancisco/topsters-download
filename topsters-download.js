import fs from 'fs'
import puppeteer from 'puppeteer'
import input from '@inquirer/input'
import confirm from '@inquirer/confirm'
import select from '@inquirer/select'

async function inputUsername (obj = {}) {
  return await input({
    message: 'Enter your last.fm username',
    default: obj.username ? obj.username : 'renatocfrancisc',
    validate: (value) => {
      const pass = value.match(/^[a-zA-Z0-9]+$/)
      if (pass) {
        return true
      }
    }
  })
}

async function selectPeriod () {
  return await select({
    message: 'Select the period of the chart',
    choices: [
      {
        name: 'a week',
        value: '7day'
      },
      {
        name: '1 month',
        value: '1month'
      },
      {
        name: '3 months',
        value: '3month'
      },
      {
        name: '6 months',
        value: '6month'
      },
      {
        name: '12 months',
        value: '12month'
      },
      {
        name: 'overall',
        value: 'overall'
      }
    ]
  })
}

async function selectSize () {
  return await select({
    message: 'Select the size of the chart',
    choices: [
      {
        name: 'collage',
        value: '25'
      },
      {
        name: '40',
        value: '40'
      },
      {
        name: '42',
        value: '42'
      },
      {
        name: '100',
        value: '100'
      }
    ]
  })
}

async function confirmPeriod (obj = {}) {
  return await confirm({
    message: `Do you want to select the period of the chart? default: ${
      obj.period ? obj.period : 'a week'
    }`,
    default: false
  }).then(async (answer) => {
    if (answer) {
      return await selectPeriod()
    } else {
      return obj.period ? obj.period : '7day'
    }
  })
}

function nameSize (size) {
  switch (size) {
    case '25':
      return 'collage'
    default:
      return size
  }
}

async function confirmSize (obj = {}) {
  return await confirm({
    message: `Do you want to select the size of the chart? default: ${
      obj.size ? nameSize(obj.size) : '42'
    }`,
    default: false
  }).then(async (answer) => {
    if (answer) {
      return await selectSize()
    } else {
      return obj.size ? obj.size : '42'
    }
  })
}

async function inputRows (obj = {}) {
  return await input({
    message: 'Select the number of rows (1-12)',
    default: obj.rows ? obj.rows : '6',
    validate: (value) => {
      const pass = value.match(/^[0-9]+$/)
      if (pass) {
        return true
      }

      return 'Please enter a valid number'
    }
  })
}

async function inputColumns (obj = {}) {
  return await input({
    message: 'Select the number of columns (1-12)',
    default: obj.columns ? obj.columns : '6',
    validate: (value) => {
      const pass = value.match(/^[0-9]+$/)
      if (pass) {
        return true
      }

      return 'Please enter a valid number'
    }
  })
}

async function inputPadding (obj = {}) {
  return await input({
    message: 'Select the padding of the chart (1-20)',
    default: obj.padding ? obj.padding : '2',
    validate: (value) => {
      const pass = value.match(/^[0-9]+$/)
      if (pass) {
        return true
      }
    }
  })
}

async function confirmBackgroundColor (obj = {}) {
  return await confirm({
    message: 'Do you want to change the background color?',
    default: obj.optBackgroundColor ? obj.optBackgroundColor : false
  })
}

async function inputBackgroundColor (obj = {}) {
  return await input({
    message: 'Enter the background color',
    default: obj.hexColor ? obj.hexColor : '000000',
    validate: (value) => {
      const pass = value.match(/^[a-zA-Z0-9]+$/)
      if (pass) {
        return true
      }
    }
  })
}

async function confirmAlbumTitles (obj = {}) {
  return await confirm({
    message: 'Do you want to display the album titles?',
    default: obj.albumTitles ? obj.albumTitles : false
  })
}

async function confirmNumbered () {
  return await confirm({
    message: 'Do you want to display the album numbers?',
    default: false
  })
}

async function confirmPlayCounts () {
  return await confirm({
    message: 'Do you want to display the playcounts?',
    default: false
  })
}

(async () => {
  let json = {}

  if (fs.existsSync('options.json')) {
    const options = fs.readFileSync('options.json')
    json = JSON.parse(options)
  }

  if (['-y'].includes(process.argv[2]) && !json) {
    console.log('Not possible to execute option "-y" without a options.json')
    process.exit()
  }

  if (['-y'].includes(process.argv[2]) && json) {
    await downloadTopstersImage(json)
  } else {
    let hexColor = '#000'
    let albumTitlesOptions = [false, false]
    let rows = 6
    let columns = 6

    const username = await inputUsername(json)
    const period = await confirmPeriod(json)
    const size = await confirmSize(json)

    if (size === '25') {
      rows = await inputRows(json)
      columns = await inputColumns(json)
    }

    const padding = await inputPadding(json)
    const optBackgroundColor = await confirmBackgroundColor(json)
    if (optBackgroundColor) {
      const backColor = await inputBackgroundColor(json)
      hexColor = backColor[0] === '#' ? backColor : '#' + backColor
    }

    const albumTitles = await confirmAlbumTitles(json)
    if (albumTitles) {
      const numbered = await confirmNumbered(json)
      const playCounts = await confirmPlayCounts(json)
      albumTitlesOptions = [numbered, playCounts]
    }

    const data = {
      username,
      rows,
      columns,
      padding,
      period,
      size,
      albumTitles,
      optBackgroundColor,
      hexColor,
      albumTitlesOptions
    }
    const jsonData = JSON.stringify(data)
    fs.writeFileSync('options.json', jsonData, 'utf-8')

    await downloadTopstersImage(data)
  }

  async function downloadTopstersImage (data) {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox']
    })

    const page = await browser.newPage()

    await page.goto('https://www.neverendingchartrendering.org/', {
      waitUntil: 'networkidle2'
    })

    console.log('page loaded...')
    await page.waitForSelector('#lastfm-button')
    await page.click('#lastfm-button')

    await page.waitForSelector('#lastfm-username-field')
    await page.type('#lastfm-username-field', data.username, {
      delay: 50
    })

    // value of options available: 7day, 1month, 3month, 6month, 12month, overall
    await page.waitForSelector('#lastfm-modal > div:nth-child(6) > select')
    await page.select('#lastfm-modal > div:nth-child(6) > select', data.period)

    // import
    await page.click('#lastfm-modal > div:nth-child(8) > button')
    console.log('importing...')
    await new Promise((resolve) => setTimeout(resolve, 5000))

    // options
    console.log('options...')
    await page.click('#customizations > button:nth-child(9)')
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // size
    console.log('size...')
    await page.waitForSelector('#customizations > div > label:nth-child(1) > select')
    // value of option: 25, 40, 42, 100
    await page.select('#customizations > div > label:nth-child(1) > select', data.size)

    // rows / columns
    if (data.size === '25') {
      console.log('rows / columns...')
      await page.waitForSelector('#customizations > div > label:nth-child(3) > span > input[type=range]')
      await new Promise((resolve) => setTimeout(resolve, 2000))

      await page.$eval('#customizations > div > label:nth-child(3) > span > input[type=range]', (element, value) => {
        element.value = value
      }, String(data.rows))

      // focus on the input and then type right and left arrow to trigger the change event
      await page.focus('#customizations > div > label:nth-child(3) > span > input[type=range]')
      await moveSizeInput(data.rows)

      await page.$eval('#customizations > div > label:nth-child(5) > span > input[type=range]', (element, value) => {
        element.value = value
      }, String(data.columns))
      await page.focus('#customizations > div > label:nth-child(5) > span > input[type=range]')
      await moveSizeInput(data.columns)
    };

    // album titles
    if (data.albumTitles) {
      console.log('album titles...')
      await page.waitForSelector('#titled > input[type=checkbox]')
      await page.click('#titled > input[type=checkbox]')

      if (data.albumTitlesOptions[0]) {
        console.log('numbered...')
        await page.waitForSelector('#numbered > input[type=checkbox]')
        await page.click('#numbered > input[type=checkbox]')
      }

      if (data.albumTitlesOptions[1]) {
        console.log('play counts...')
        await page.waitForSelector('#playcounts > input[type=checkbox]')
        await page.click('#playcounts > input[type=checkbox]')
      }
    }

    // background color
    if (data.optBackgroundColor) {
      console.log('background color...')
      const colorSelector = `#customizations > div > label:nth-child(${data.size === '25' ? '15' : '11'}) > input[type=search]`
      await page.waitForSelector(colorSelector)
      await limparInput(colorSelector)
      await page.type(colorSelector, data.hexColor, {
        delay: 50
      })
    }

    // shadows
    console.log('shadows...')
    await page.waitForSelector('#shadowed > input[type=checkbox]')
    await page.click('#shadowed > input[type=checkbox]')

    // padding
    if (data.padding !== '2') {
      console.log('padding...')
      const paddingSelector = `#customizations > div > label:nth-child(${data.size === '25' ? '19' : '15'}) > span > input[type=range]`
      await page.$eval(paddingSelector, (element, value) => {
        element.value = value
      }, data.padding)
      await page.focus(paddingSelector)
      if (data.padding === '20') {
        await page.keyboard.press('ArrowLeft')
        await page.keyboard.press('ArrowRight')
      } else {
        await page.keyboard.press('ArrowRight')
        await page.keyboard.press('ArrowLeft')
      }
    }

    console.log('rendering...')
    await page.waitForSelector('#buttons > form > button:nth-child(8)')
    await page.click('#buttons > form > button:nth-child(8)')

    console.log('waiting for rendering...')
    await new Promise((resolve) => setTimeout(resolve, 15000))

    await browser.close()
    process.exit()

    async function moveSizeInput (value) {
      if (value === 12) {
        await page.keyboard.press('ArrowLeft')
        await page.keyboard.press('ArrowRight')
      } else {
        await page.keyboard.press('ArrowRight')
        await page.keyboard.press('ArrowLeft')
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    async function limparInput (selector) {
      await page.click(selector)
      await page.keyboard.down('Control')
      await page.keyboard.press('A')
      await page.keyboard.up('Control')
      await page.keyboard.press('Backspace')
    }
  }
})()
