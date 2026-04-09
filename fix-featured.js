const dotenv = require('dotenv');
dotenv.config();
const mysql = require('mysql2/promise');

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
  });

  // Marquer le match live comme featured + premium
  await conn.execute('UPDATE matches SET isFeatured = 1, isPremium = 1 WHERE status = "live" LIMIT 1');
  console.log('✅ Match live marqué comme Featured + Premium');

  const [rows] = await conn.execute('SELECT id, homeTeam, awayTeam, status, isPremium, isFeatured FROM matches');
  console.log(JSON.stringify(rows, null, 2));
  
  await conn.end();
}

main().catch(console.error);
