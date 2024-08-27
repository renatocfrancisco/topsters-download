export async function waitUntilDownload (page) {
  return new Promise((resolve, reject) => {
    page._client().on('Page.downloadProgress', (e) => {
      // or 'Browser.downloadProgress'
      if (e.state === 'completed') {
        resolve()
      } else if (e.state === 'canceled') {
        reject(new Error('Download canceled'))
      }
    })
  })
}
