const { chromium } = require('playwright');
const cheerio = require('cheerio');

async function test() {
    console.log('--- INSPECTING COMPETITION HEADERS ---');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const url = 'https://www.soccerway.com/team/monastir/zixQ6fq8/results/';
    
    try {
        await page.goto(url, { waitUntil: 'networkidle' });
        const content = await page.content();
        const $ = cheerio.load(content);
        
        // Look for headers. common Flashscore classes: .event__header, .event__title, .wcl-category_...
        const headers = $('.event__header, .event__title, .event__title--name');
        console.log(`Found ${headers.length} headers.`);
        
        headers.each((i, el) => {
            console.log(`Header ${i}: "${$(el).text().trim()}"`);
        });

        // Check the relationship between rows and headers
        const rows = $('.event__match, .ui-table__row');
        console.log(`Found ${rows.length} rows.`);
        
    } catch (e) {
        console.error(e.message);
    } finally {
        await browser.close();
    }
}

test();
