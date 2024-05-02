import input from '@inquirer/input'
import confirm from '@inquirer/confirm'
import select from '@inquirer/select'

export async function inputUsername (obj = {}) {
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

export async function confirmPeriod (obj = {}) {
  return await confirm({
    message: `Do you want to select the period of the chart? default: ${obj.period ? obj.period : 'a week'}`,
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

export async function confirmSize (obj = {}) {
  return await confirm({
    message: `Do you want to select the size of the chart? default: ${obj.size ? nameSize(obj.size) : '42'}`,
    default: false
  }).then(async (answer) => {
    if (answer) {
      return await selectSize()
    } else {
      return obj.size ? obj.size : '42'
    }
  })
}

export async function inputRows (obj = {}) {
  return await input({
    message: 'Select the number of rows (1-12)',
    default: obj.rows ? obj.rows : '5',
    validate: (value) => {
      const pass = value.match(/^[0-9]+$/)
      if (pass) {
        return true
      }

      return 'Please enter a valid number'
    }
  })
}

export async function inputColumns (obj = {}) {
  return await input({
    message: 'Select the number of columns (1-12)',
    default: obj.columns ? obj.columns : '5',
    validate: (value) => {
      const pass = value.match(/^[0-9]+$/)
      if (pass) {
        return true
      }

      return 'Please enter a valid number'
    }
  })
}

export async function inputPadding (obj = {}) {
  return await input({
    message: 'Select the padding of the chart (0-150)',
    default: obj.gap ? obj.gap : '6',
    validate: (value) => {
      const pass = value.match(/^[0-9]+$/)
      if (pass) {
        return true
      }
    }
  })
}

export async function confirmAlbumTitles (obj = {}) {
  return await confirm({
    message: 'Do you want to display the album titles?',
    default: obj.albumTitles ? obj.albumTitles : false
  })
}

export async function confirmNumbered () {
  return await confirm({
    message: 'Do you want to display the album numbers?',
    default: false
  })
}
