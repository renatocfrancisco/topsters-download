import { input, select } from '@inquirer/prompts';
import puppeteer from 'puppeteer';

(async () => {
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
        ],
    });
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
        ],
    });

    if(size === '25') {
        const rows = await input({
            message: 'Select the number of rows',
            initial: '6',
            validate: (value) => {
                const pass = value.match(
                    /^[0-9]+$/
                );
                if (pass) {
                    return true;
                }

                return 'Please enter a valid number';
            }
        });

        const columns = await input({
            message: 'Select the number of columns',
            initial: '6',
            validate: (value) => {
                const pass = value.match(
                    /^[0-9]+$/
                );
                if (pass) {
                    return true;
                }

                return 'Please enter a valid number';
            }
        });

        var size_arr = [String(rows), String(columns)];
    };

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
    await page.select('#lastfm-modal > div:nth-child(6) > select', period);

    // import
    await page.click('#lastfm-modal > div:nth-child(8) > button');
    console.log('importing...');
    await new Promise(r => setTimeout(r, 5000));

    // options
    console.log('options...');
    await page.click('#customizations > button:nth-child(9)');
    await new Promise(r => setTimeout(r, 2000));

    // size
    console.log('size...');
    await page.waitForSelector('#customizations > div > label:nth-child(1) > select');
    // value of option: 25, 40, 42, 100
    await page.select('#customizations > div > label:nth-child(1) > select', size);

    // rows / columns
    if(size === '25') {
        console.log('rows / columns...');
        await page.waitForSelector('#customizations > div > label:nth-child(3) > span > input[type=range]');
    
        const rangeInput1 = await page.$('#customizations > div > label:nth-child(3) > span > input[type=range]');
        await rangeInput1.type(String(size_arr[0]), { delay: 100 });
    
        const rangeInput2 = await page.$('#customizations > div > label:nth-child(5) > span > input[type=range]');
        await rangeInput2.type(String(size_arr[1]), { delay: 100 })
    };

    console.log('rendering...');
    await page.waitForSelector('#buttons > form > button:nth-child(8)');
    await page.click('#buttons > form > button:nth-child(8)');

    console.log('waiting for rendering...');
    await new Promise(r => setTimeout(r, 15000));

    await browser.close();
})();