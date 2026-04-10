const { chromium } = require('playwright');
const cheerio = require('cheerio');

async function scrapeStandings() {
    console.log('Starting Soccerway standings scraping with Playwright...');
    const url = 'https://www.soccerway.com/tunisia/ligue-professionnelle-1/standings/';
    
    const browser = await chromium.launch({ headless: true });
    try {
      const context = await browser.newContext({ 
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
      });
      const page = await context.newPage();
      
      try {
        console.log(`Navigating to ${url}`);
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
        
        console.log('Waiting for table...');
        await page.waitForSelector('.table__row, .ui-table, table.standings', { timeout: 15000 });

        const content = await page.content();
        const $ = cheerio.load(content);

        const rows = $('.table__row, .ui-table__row, tr.row, .table-container tr');
        console.log(`Found ${rows.length} potential standing rows`);
        
        const results = [];

        for (let i = 0; i < rows.length; i++) {
          const el = rows[i];
          const $el = $(el);
          
          let teamName = $el.find('.tableCellParticipant__name, .participant-name, .team-a, a.team, td.team').text().trim();
          if (!teamName || teamName.toLowerCase().includes('team')) continue;

          let rank = 0, played = 0, won = 0, drawn = 0, lost = 0, points = 0;

          if ($el.find('.tableCellRank').length > 0 || $el.hasClass('table__row')) {
              // Flashscore layout refined
              rank = parseInt($el.find('.tableCellRank, .table__cell--rank').text().replace('.', '')) || i + 1;
              played = parseInt($el.find('.table__cell--matches_played').text()) || 0;
              won = parseInt($el.find('.table__cell--wins_regular').text()) || 0;
              drawn = parseInt($el.find('.table__cell--draws').text()) || 0;
              lost = parseInt($el.find('.table__cell--losses_regular').text()) || 0;
              points = parseInt($el.find('.table__cell--points').text()) || 0;
          } else if ($el.hasClass('ui-table__row')) {
              // Alternative Flashscore layout
              rank = parseInt($el.find('.ui-table__cell--rank').text()) || i + 1;
              played = parseInt($el.find('.ui-table__cell--matches_played').text()) || 0;
              won = parseInt($el.find('.ui-table__cell--wins_regular').text()) || 0;
              drawn = parseInt($el.find('.ui-table__cell--draws').text()) || 0;
              lost = parseInt($el.find('.ui-table__cell--losses_regular').text()) || 0;
              points = parseInt($el.find('.ui-table__cell--points').text()) || 0;
          }

          results.push({ teamName, rank, played, won, drawn, lost, points });
        }

        console.log('SCRAPED DATA PREVIEW (Top 5):');
        console.table(results.slice(0, 5));
        
        const monastir = results.find(r => r.teamName.toLowerCase().includes('monastir'));
        if (monastir) {
            console.log('US MONASTIR DATA:', monastir);
        } else {
            console.log('WARNING: US Monastir not found in table.');
        }

      } finally {
        await page.close();
        await context.close();
      }
    } catch (err) {
      console.error(`Error scraping standings: ${err.message}`);
    } finally {
      await browser.close();
    }
}

scrapeStandings();
