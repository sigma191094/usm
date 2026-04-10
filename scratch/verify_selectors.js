const { chromium } = require('playwright');
const cheerio = require('cheerio');

async function test() {
    console.log('Launching browser...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    
    const url = 'https://www.soccerway.com/tunisia/ligue-professionnelle-1/standings/';
    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        await page.waitForSelector('.ui-table, table.standings', { timeout: 15000 });
        const content = await page.content();
        const $ = cheerio.load(content);
        
        // Find rows
        const rows = $('.ui-table__row, tr.row, .table-container tr');
        console.log(`Found ${rows.length} rows.`);
        
        if (rows.length > 0) {
            const firstRow = rows.first();
            console.log('First row HTML snippet:', firstRow.html().substring(0, 500));
            console.log('Text content:', firstRow.text().trim().replace(/\s+/g, ' '));
            
            // Test specific selectors from my implementation
            const teamName = firstRow.find('.participant-name, .team-a, a.team, td.team').text().trim();
            console.log('Extracted Team Name:', teamName);
            
            const rank = firstRow.find('.ui-table__cell--rank').text().trim();
            console.log('Extracted Rank (Flashscore):', rank);
            
            const points = firstRow.find('.ui-table__cell--points').text().trim();
            console.log('Extracted Points (Flashscore):', points);
        }
        
    } catch (e) {
        console.error('ERROR:', e.message);
    } finally {
        await browser.close();
    }
}

test();
