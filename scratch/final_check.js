const { chromium } = require('playwright');
const cheerio = require('cheerio');

async function test() {
    console.log('--- TESTING TEAM RESULTS PAGE ---');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const url = 'https://www.soccerway.com/team/monastir/zixQ6fq8/results/';
    
    try {
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.waitForSelector('.event__match, tr.match, .ui-table__row, .table__row');
        const content = await page.content();
        const $ = cheerio.load(content);
        
        const rows = $('.event__match, .ui-table__row, .table__row, tr.match');
        console.log(`Found ${rows.length} rows.`);
        
        if (rows.length > 0) {
            const first = rows.first();
            console.log('ROW CLASSES:', first.attr('class'));
            console.log('ROW HTML SNIPPET:', first.html().substring(0, 800));
            console.log('TEXT:', first.text().trim().replace(/\s+/g, ' '));
        }
    } catch (e) {
        console.error(e.message);
    } finally {
        await browser.close();
    }
}

test();
