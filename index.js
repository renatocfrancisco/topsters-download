import input from '@inquirer/input'
import confirm from '@inquirer/confirm'
import select from '@inquirer/select'
import puppeteer from 'puppeteer'
import fs from 'fs';

(async () => {
  // check if options.json exists
  if (fs.existsSync('options.json')) {
    const options = fs.readFileSync('options.json')
    const data = JSON.parse(options)
    var json = [data.username, [data.rows, data.columns], data.padding, data.background_color, data.period, data.size, data.album_titles, data.album_titles_options, data.opt_background_color, data.hex_color]
  }

  if (['-y'].includes(process.argv[2]) && !json) {
    console.log('Not possible to execute option "-y" without a options.json')
    process.exit()
  }

  if (['-y'].includes(process.argv[2]) && json) {
    var [username, size_arr, padding, back_color, period, size, album_titles, album_titles_options, opt_background_color, hex_color] = json
  } else {
    var { username, size_arr, padding, back_color, period, size, album_titles, album_titles_options, opt_background_color, hex_color } = await optionsInputs()
    if (size_arr == undefined) {
      size_arr = [6, 6]
    }
    // save options on a json file
    const data = {
      username,
      rows: size_arr[0],
      columns: size_arr[1],
      padding,
      background_color: back_color,
      period,
      size,
      album_titles,
      album_titles_options,
      opt_background_color,
      hex_color
    }
    const jsonData = JSON.stringify(data)
    fs.writeFileSync('options.json', jsonData, 'utf-8')
  }

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
  await page.type('#lastfm-username-field', username, {
    delay: 50
  })

  // value of options available: 7day, 1month, 3month, 6month, 12month, overall
  await page.waitForSelector('#lastfm-modal > div:nth-child(6) > select')
  await page.select('#lastfm-modal > div:nth-child(6) > select', period)

  // import
  await page.click('#lastfm-modal > div:nth-child(8) > button')
  console.log('importing...')
  await new Promise(r => setTimeout(r, 5000))

  // options
  console.log('options...')
  await page.click('#customizations > button:nth-child(9)')
  await new Promise(r => setTimeout(r, 2000))

  // size
  console.log('size...')
  await page.waitForSelector('#customizations > div > label:nth-child(1) > select')
  // value of option: 25, 40, 42, 100
  await page.select('#customizations > div > label:nth-child(1) > select', size)

  // rows / columns
  if (size === '25') {
    console.log('rows / columns...')
    await page.waitForSelector('#customizations > div > label:nth-child(3) > span > input[type=range]')
    await new Promise(r => setTimeout(r, 2000))

    await page.$eval('#customizations > div > label:nth-child(3) > span > input[type=range]', (element, value) => {
      element.value = value
    }, String(size_arr[0]))

    // focus on the input and then type right and left arrow to trigger the change event
    await page.focus('#customizations > div > label:nth-child(3) > span > input[type=range]')
    if (size_arr[0] === 12) {
      await page.keyboard.press('ArrowLeft')
      await page.keyboard.press('ArrowRight')
    } else {
      await page.keyboard.press('ArrowRight')
      await page.keyboard.press('ArrowLeft')
    }
    await new Promise(r => setTimeout(r, 1000))

    await page.$eval('#customizations > div > label:nth-child(5) > span > input[type=range]', (element, value) => {
      element.value = value
    }, String(size_arr[1]))
    await page.focus('#customizations > div > label:nth-child(5) > span > input[type=range]')
    if (size_arr[1] === 12) {
      await page.keyboard.press('ArrowLeft')
      await page.keyboard.press('ArrowRight')
    } else {
      await page.keyboard.press('ArrowRight')
      await page.keyboard.press('ArrowLeft')
    }
    await new Promise(r => setTimeout(r, 1000))
  };

  // album titles
  if (album_titles) {
    console.log('album titles...')
    await page.waitForSelector('#titled > input[type=checkbox]')
    await page.click('#titled > input[type=checkbox]')

    if (album_titles_options[0]) {
      console.log('numbered...')
      await page.waitForSelector('#numbered > input[type=checkbox]')
      await page.click('#numbered > input[type=checkbox]')
    }

    if (album_titles_options[1]) {
      console.log('play counts...')
      await page.waitForSelector('#playcounts > input[type=checkbox]')
      await page.click('#playcounts > input[type=checkbox]')
    }
  }

  // background color
  if (opt_background_color) {
    console.log('background color...')
    const colorSelector = `#customizations > div > label:nth-child(${size === 25 ? '15' : '11'}) > input[type=search]`
    await page.waitForSelector(colorSelector)
    await limparInput(colorSelector)
    await page.type(colorSelector, hex_color, {
      delay: 50
    })
  }

  // shadows
  console.log('shadows...')
  await page.waitForSelector('#shadowed > input[type=checkbox]')
  await page.click('#shadowed > input[type=checkbox]')

  // padding
  if (padding !== '2') {
    console.log('padding...')
    const paddingSelector = `#customizations > div > label:nth-child(${size === 25 ? '19' : '15'}) > span > input[type=range]`
    await page.$eval(paddingSelector, (element, value) => {
      element.value = value
    }, padding)
    await page.focus(paddingSelector)
    if (padding === '20') {
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
  await new Promise(r => setTimeout(r, 15000))

  await browser.close()
  process.exit()

  async function optionsInputs () {
    const username = await input({
      message: 'Enter your last.fm username',
      default: json ? json[0] : 'renatocfrancisc',
      validate: (value) => {
        const pass = value.match(
          /^[a-zA-Z0-9]+$/
        )
        if (pass) {
          return true
        }
      }
    })

    const period = await select({
      message: 'Select the period of the chart',
      choices: [
        {
          title: '7day',
          value: '7day'
        },
        {
          title: '1month',
          value: '1month'
        },
        {
          title: '3month',
          value: '3month'
        },
        {
          title: '6month',
          value: '6month'
        },
        {
          title: '12month',
          value: '12month'
        },
        {
          title: 'overall',
          value: 'overall'
        }
      ]
    })

    const size = await select({
      message: 'Select the size of the chart',
      choices: [
        {
          title: 'collage',
          value: '25'
        },
        {
          title: '40',
          value: '40'
        },
        {
          title: '42',
          value: '42'
        },
        {
          title: '100',
          value: '100'
        }
      ]
    })

    if (size === '25') {
      const rows = await input({
        message: 'Select the number of rows (1-12)',
        default: json ? json[1][0] : '6',
        validate: (value) => {
          const pass = value.match(
            /^[0-9]+$/
          )
          if (pass) {
            return true
          }

          return 'Please enter a valid number'
        }
      })

      const columns = await input({
        message: 'Select the number of columns (1-12)',
        default: json ? json[1][1] : '6',
        validate: (value) => {
          const pass = value.match(
            /^[0-9]+$/
          )
          if (pass) {
            return true
          }

          return 'Please enter a valid number'
        }
      })

      var size_arr = [String(rows), String(columns)]
    };

    const padding = await input({
      message: 'Select the padding of the chart (1-20)',
      default: json ? json[2] : '2',
      validate: (value) => {
        const pass = value.match(
          /^[0-9]+$/
        )
        if (pass) {
          return true
        }
      }
    })

    const opt_background_color = await confirm({
      message: 'Do you want to change the background color?',
      default: false
    })

    if (opt_background_color) {
      const background_color = await input({
        message: 'Enter the background color',
        default: json ? json[3] : '000000',
        validate: (value) => {
          const pass = value.match(
            /^[a-zA-Z0-9]+$/
          )
          if (pass) {
            return true
          }
        }
      })

      var hex_color = '#' + background_color
      var back_color = background_color
    }

    const album_titles = await confirm({
      message: 'Do you want to display the album titles?',
      default: false
    })

    if (album_titles) {
      const numbered = await confirm({
        message: 'Do you want to display the album numbers?',
        initial: true
      })

      const play_counts = await confirm({
        message: 'Do you want to display the playcounts?',
        initial: true
      })

      var album_titles_options = [numbered, play_counts]
    }
    return { username, size_arr, padding, back_color, period, size, album_titles, album_titles_options, opt_background_color, hex_color }
  }

  async function limparInput (selector) {
    await page.click(selector)
    await page.keyboard.down('Control')
    await page.keyboard.press('A')
    await page.keyboard.up('Control')
    await page.keyboard.press('Backspace')
  }
})()
