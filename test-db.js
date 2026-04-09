const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'usm_media'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed:', err.stack);
    return;
  }
  console.log('✅ Connected as id ' + connection.threadId);
  
  connection.query('SHOW TABLES', (err, results) => {
    if (err) throw err;
    console.log('Tables in database:', results);
    connection.end();
  });
});
