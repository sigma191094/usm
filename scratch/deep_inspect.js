const { chromium } = require('playwright');
const cheerio = require('cheerio');

async function test() {
    console.log('--- DEEP DOM INSPECTION ---');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const url = 'https://www.soccerway.com/team/monastir/zixQ6fq8/results/';
    
    try {
        await page.goto(url, { waitUntil: 'networkidle' });
        // Let's scroll down to make sure all rows are loaded
        await page.evaluate(() => window.scrollBy(0, 5000));
        await page.waitForTimeout(2000);

        const content = await page.content();
        const $ = cheerio.load(content);
        
        // Find the most likely parent of matches
        const matchRows = $('.event__match');
        if (matchRows.length === 0) {
            console.log('No matches found with .event__match');
            return;
        }

        const parent = matchRows.first().parent();
        console.log(`Parent class: "${parent.attr('class')}" Tag: ${parent.prop('tagName')}`);

        // List all children of the parent to see the sequence
        parent.children().each((i, el) => {
            const $el = $(el);
            const text = $el.text().trim().replace(/\s+/g, ' ');
            const className = $el.attr('class') || '';
            const tagName = $el.prop('tagName');
            
            // Only log if it's a match or likely a header
            if ($el.hasClass('event__match') || text.length < 100) {
                 console.log(`CHILD ${i}: <${tagName} class="${className}"> | TEXT: "${text}"`);
            }
        });

    } catch (e) {
        console.error(e.message);
    } finally {
        await browser.close();
    }
}

test();
