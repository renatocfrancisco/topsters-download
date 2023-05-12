import { input, select, confirm } from '@inquirer/prompts';
import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {

    // check if options.json exists
    if (fs.existsSync('options.json')) {
        const options = fs.readFileSync('options.json');
        const data = JSON.parse(options);
        var json_username = data.username;
        var json_rows = data.rows;
        var json_columns = data.columns;
        var json_padding = data.padding;
        var json_background_color = data.background_color;
    }

    const username = await input({
        message: 'Enter your last.fm username',
        default: json_username ? json_username : 'renatocfrancisc',
        validate: (value) => {
            const pass = value.match(
                /^[a-zA-Z0-9]+$/
            );
            if (pass) {
                return true;
            }
        }
    });

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

    if (size === '25') {
        const rows = await input({
            message: 'Select the number of rows (1-12)',
            default: json_rows ? json_rows : '6',
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
            message: 'Select the number of columns (1-12)',
            default: json_columns ? json_columns : '6',
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

    const padding = await input({
        message: 'Select the padding of the chart',
        default: json_padding ? json_padding : '2',
        validate: (value) => {
            const pass = value.match(
                /^[0-9]+$/
            );
            if (pass) {
                return true;
            }
        }
    });

    const opt_background_color = await confirm({
        message: 'Do you want to change the background color?',
        initial: true
    });

    if(opt_background_color){
        const background_color = await input({
            message: 'Enter the background color',
            default: json_background_color ? json_background_color : '000000',
            validate: (value) => {
                const pass = value.match(
                    /^[a-zA-Z0-9]+$/
                );
                if (pass) {
                    return true;
                }
            }
        });

        var hex_color = '#' + background_color;
        var back_color = background_color;

    }

    const album_titles = await confirm({
        message: 'Do you want to display the album titles?',
        initial: true
    });

    if(album_titles) {
        const numbered = await confirm({
            message: 'Do you want to display the album numbers?',
            initial: true
        });

        const play_counts = await confirm({
            message: 'Do you want to display the playcounts?',
            initial: true
        });

        var album_titles_options = [numbered, play_counts];
    }

    // save options on a json file
    const data = {
        username: username,
        rows: size_arr[0],
        columns: size_arr[1],
        padding: padding,
        background_color: back_color
    };
    const jsonData = JSON.stringify(data);
    fs.writeFileSync('options.json', jsonData, 'utf-8');

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
    await page.type('#lastfm-username-field', username, {
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
    if (size === '25') {
        console.log('rows / columns...');
        await page.waitForSelector('#customizations > div > label:nth-child(3) > span > input[type=range]');
        await new Promise(r => setTimeout(r, 2000));

        await page.$eval('#customizations > div > label:nth-child(3) > span > input[type=range]', (element, value) => {
            element.value = value;
        }, String(size_arr[0]));

        // focus on the input and then type right and left arrow to trigger the change event
        await page.focus('#customizations > div > label:nth-child(3) > span > input[type=range]');
        if(size_arr[0] === 12){
            await page.keyboard.press('ArrowLeft');
            await page.keyboard.press('ArrowRight');
        }else{
            await page.keyboard.press('ArrowRight');
            await page.keyboard.press('ArrowLeft');
        }
        await new Promise(r => setTimeout(r, 1000));

        await page.$eval('#customizations > div > label:nth-child(5) > span > input[type=range]', (element, value) => {
            element.value = value;
        }, String(size_arr[1]));
        await page.focus('#customizations > div > label:nth-child(5) > span > input[type=range]');
        if(size_arr[1] === 12){
            await page.keyboard.press('ArrowLeft');
            await page.keyboard.press('ArrowRight');
        }else{
            await page.keyboard.press('ArrowRight');
            await page.keyboard.press('ArrowLeft');
        }
        await new Promise(r => setTimeout(r, 1000));
    };

    // album titles
    if(album_titles) {
        console.log('album titles...');
        await page.waitForSelector('#titled > input[type=checkbox]');
        await page.click('#titled > input[type=checkbox]');

        if(album_titles_options[0]) {
            console.log('numbered...');
            await page.waitForSelector('#numbered > input[type=checkbox]');
            await page.click('#numbered > input[type=checkbox]');
        }

        if(album_titles_options[1]){
            console.log('play counts...');
            await page.waitForSelector('#playcounts > input[type=checkbox]');
            await page.click('#playcounts > input[type=checkbox]');
        }
    }

    // background color
    if(opt_background_color){
        console.log('background color...');
        await page.waitForSelector('#customizations > div > label:nth-child(15) > input[type=search]');
        await limparInput('#customizations > div > label:nth-child(15) > input[type=search]');
        await page.type('#customizations > div > label:nth-child(15) > input[type=search]', hex_color, {
            delay: 50
        });
    }

    // shadows
    console.log('shadows...');
    await page.waitForSelector('#shadowed > input[type=checkbox]');
    await page.click('#shadowed > input[type=checkbox]');

    // padding
    if(padding !== '2'){
        console.log('padding...');
        await page.$eval('#customizations > div > label:nth-child(19) > span > input[type=range]', (element, value) => {
            element.value = value;
        }, padding);
        await page.focus('#customizations > div > label:nth-child(19) > span > input[type=range]');
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowLeft');
    }

    console.log('rendering...');
    await page.waitForSelector('#buttons > form > button:nth-child(8)');
    await page.click('#buttons > form > button:nth-child(8)');

    console.log('waiting for rendering...');
    await new Promise(r => setTimeout(r, 15000));

    await browser.close();
    process.exit()

    async function limparInput(selector) {
        await page.click(selector);
        await page.keyboard.down('Control');
        await page.keyboard.press('A');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');
    }
})();