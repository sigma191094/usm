const { chromium } = require('playwright');
const cheerio = require('cheerio');

async function test() {
    console.log('--- RECURSIVE HEADER INSPECTION ---');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const url = 'https://www.soccerway.com/team/monastir/zixQ6fq8/results/';
    
    try {
        await page.goto(url, { waitUntil: 'networkidle' });
        const content = await page.content();
        const $ = cheerio.load(content);
        
        // Let's find any div that contains "Ligue" or "Cup" or "League"
        const potentialHeaders = $('div, span, td').filter((i, el) => {
            const text = $(el).text().trim();
            return (text.includes('Ligue') || text.includes('Cup') || text.includes('League') || text.includes('Friendly')) 
                   && text.length < 50;
        });

        console.log(`Found ${potentialHeaders.length} potential text elements.`);
        
        potentialHeaders.each((i, el) => {
            console.log(`Potential ${i}: [${$(el).prop('tagName')}] class="${$(el).attr('class')}" content="${$(el).text().trim()}"`);
        });

    } catch (e) {
        console.error(e.message);
    } finally {
        await browser.close();
    }
}

test();
