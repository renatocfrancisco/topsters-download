const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();

    await page.goto('https://www.neverendingchartrendering.org/', {
        waitUntil: 'networkidle2'
    });

    console.log('page loaded...');
    await page.waitForSelector('#lastfm-button');
    await page.click('#lastfm-button');

    await page.waitForSelector('#lastfm-username-field');
    await page.type('#lastfm-username-field', 'renatocfrancisc', {
        delay: 50
    });

    // value of options available: 7day, 1month, 3month, 6month, 12month, overall
    await page.waitForSelector('#lastfm-modal > div:nth-child(6) > select');
    await page.select('#lastfm-modal > div:nth-child(6) > select', '1month');

    // import
    await page.click('#lastfm-modal > div:nth-child(8) > button');
    console.log('importing...');
    await page.waitForTimeout(5000);

    // options
    console.log('options...');
    await page.click('#customizations > button:nth-child(9)');
    await page.waitForTimeout(2000);

    // size
    console.log('size...');
    await page.waitForSelector('#customizations > div > label:nth-child(1) > select');
    // value of option: 25, 40, 42, 100
    await page.select('#customizations > div > label:nth-child(1) > select', '25');

    // rows / columns
    console.log('rows / columns...');
    await page.waitForSelector('#customizations > div > label:nth-child(3) > span > input[type=range]');

    const rangeInput1 = await page.$('#customizations > div > label:nth-child(3) > span > input[type=range]');
    await rangeInput1.type('6', { delay: 100 });

    const rangeInput2 = await page.$('#customizations > div > label:nth-child(5) > span > input[type=range]');
    await rangeInput2.type('6', { delay: 100 });

    console.log('rendering...');
    await page.waitForSelector('#buttons > form > button:nth-child(8)');
    await page.click('#buttons > form > button:nth-child(8)');

    console.log('waiting for rendering...');
    await page.waitForTimeout(15000);

    await browser.close();
})();