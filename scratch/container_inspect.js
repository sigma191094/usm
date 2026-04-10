const { chromium } = require('playwright');
const cheerio = require('cheerio');

async function test() {
    console.log('--- CONTAINER INSPECTION ---');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const url = 'https://www.soccerway.com/team/monastir/zixQ6fq8/results/';
    
    try {
        await page.goto(url, { waitUntil: 'networkidle' });
        const content = await page.content();
        const $ = cheerio.load(content);
        
        // Find the main match list container
        const container = $('.wcl-matchRow_...').parent() || $('.event__match').parent();
        
        // Find all direct children of the container
        const children = $('.sportName').children();
        console.log(`Found ${children.length} total children in match list.`);
        
        children.each((i, el) => {
            const $el = $(el);
            if ($el.hasClass('event__header') || $el.hasClass('event__title') || $el.text().includes('TUNISIA') || $el.text().includes('AFRICA')) {
                console.log(`CHILD ${i} [HEADER]: "${$el.text().trim().replace(/\s+/g, ' ')}" class="${$el.attr('class')}"`);
            } else if ($el.hasClass('event__match')) {
                // Ignore for now
            } else {
                console.log(`CHILD ${i} [OTHER]: "${$el.text().trim().substring(0, 50)}" class="${$el.attr('class')}"`);
            }
        });

    } catch (e) {
        console.error(e.message);
    } finally {
        await browser.close();
    }
}

test();
