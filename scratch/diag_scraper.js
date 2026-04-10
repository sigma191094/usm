const axios = require('axios');

const urls = [
    'https://int.soccerway.com/national/tunisia/ligue-1/20242025/regular-season/r82156/',
    'https://www.soccerway.com/teams/tunisia/union-sportive-monastirienne/1550/',
    'https://us.soccerway.com/national/tunisia/ligue-1/',
    'https://www.besoccer.com/competition/table/liga_tunecina/2025'
];

async function diag() {
    for (const url of urls) {
        console.log(`Testing ${url}...`);
        try {
            const resp = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
                },
                timeout: 5000
            });
            console.log(`  Status: ${resp.status}`);
            console.log(`  Size: ${resp.data.length} bytes`);
            console.log(`  Title: ${resp.data.match(/<title>(.*?)<\/title>/)?.[1] || 'No title'}`);
            console.log(`  Body start: ${resp.data.substring(0, 500).replace(/\n/g, ' ')}...`);
            if (resp.data.includes('Monastir')) console.log('  FOUND: "Monastir"');
            if (resp.data.includes('<table')) console.log('  FOUND: "<table>"');
        } catch (e) {
            console.log(`  Error: ${e.message}`);
        }
        console.log('---');
    }
}

diag();
