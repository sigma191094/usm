const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'usm_media',
  multipleStatements: true
});

const sql = `
CREATE TABLE IF NOT EXISTS ads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    mediaUrl TEXT,
    targetUrl TEXT,
    sponsorName VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ad_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    adId INT,
    eventType VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (adId) REFERENCES ads(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS giveaways (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    imageUrl TEXT,
    pointsCost INT DEFAULT 50,
    endDate DATETIME,
    isActive BOOLEAN DEFAULT TRUE,
    maxWinners INT DEFAULT 1,
    isFeatured BOOLEAN DEFAULT FALSE,
    winnerId INT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS giveaway_entries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    giveawayId INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (giveawayId) REFERENCES giveaways(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS objectives (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    targetAmount DECIMAL(10,2),
    currentAmount DECIMAL(10,2) DEFAULT 0,
    imageUrl TEXT,
    status VARCHAR(50) DEFAULT 'open',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    objectiveId INT NULL,
    amount DECIMAL(10,2),
    message TEXT,
    paymentMethod VARCHAR(50) DEFAULT 'card',
    status VARCHAR(50) DEFAULT 'completed',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (objectiveId) REFERENCES objectives(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS quiz_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    options TEXT,
    correctIndex INT,
    pointsReward INT DEFAULT 10,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leaderboard (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT UNIQUE,
    userName VARCHAR(255),
    userAvatar TEXT,
    totalPoints INT DEFAULT 0,
    weeklyPoints INT DEFAULT 0,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forum_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    authorId INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forum_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT,
    postId INT,
    authorId INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postId) REFERENCES forum_posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    imageUrl TEXT,
    category VARCHAR(100),
    stock INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    totalAmount DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orderId INT,
    productId INT,
    quantity INT,
    price DECIMAL(10,2),
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);
`;

connection.connect((err) => {
  if (err) {
    console.error('❌ Connection failed:', err.stack);
    return;
  }
  console.log('✅ Connected. Synchronizing tables...');
  
  connection.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Sync failed:', err.message);
    } else {
      console.log('✅ All tables created successfully in phpMyAdmin!');
    }
    connection.end();
  });
});
