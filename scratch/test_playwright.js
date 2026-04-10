const { chromium } = require('playwright');

async function test() {
    console.log('Launching browser...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    
    const url = 'https://www.soccerway.com/tunisia/ligue-professionnelle-1/standings/';
    console.log(`Navigating to ${url}...`);
    
    try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        console.log('Page loaded. Waiting for table...');
        
        await page.waitForSelector('.ui-table, table.standings', { timeout: 15000 });
        console.log('Table found!');
        
        const content = await page.content();
        console.log('Content length:', content.length);
        
        // Check for team names
        if (content.includes('Monastir')) {
            console.log('SUCCESS: "Monastir" found in rendered HTML!');
        } else {
            console.log('WARNING: "Monastir" NOT found in rendered HTML.');
            // Print some row classes to help debug
            const rowClasses = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('tr, div')).map(el => el.className).filter(c => c.includes('row') || c.includes('table')).slice(0, 10);
            });
            console.log('Sample classes found:', rowClasses);
        }
        
    } catch (e) {
        console.error('ERROR during test:', e.message);
    } finally {
        await browser.close();
    }
}

test();
