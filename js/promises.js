export async function waitUntilDownload (page) {
  return new Promise((resolve, reject) => {
    page._client().on('Page.downloadProgress', (e) => {
      // or 'Browser.downloadProgress'
      console.clear()
      if (e.state === 'completed') {
        console.log('Chart downloaded!')
        resolve()
      } else if (e.state === 'canceled') {
        reject(new Error('Download canceled'))
      }
    })
  })
}

export async function waitImageResponses (page, numImgs, responseCount = 0) {
  await new Promise((resolve, _reject) => {
    page.on('response', async (response) => {
      if (response.url().startsWith('https://lastfm.freetls.fastly.net/i/u/')) {
        responseCount++
        console.clear()
        console.log(`Image ${responseCount} of ${numImgs} downloaded...`)

        if (responseCount === numImgs) {
          resolve()
        }
      }
    })
  })
}
