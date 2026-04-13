const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '..', '..', 'web', 'out');
const destination = path.join(__dirname, '..', 'public');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log(`🚀 Copying frontend from ${source} to ${destination}...`);

try {
  if (fs.existsSync(destination)) {
    console.log('🧹 Cleaning existing public folder...');
    fs.rmSync(destination, { recursive: true, force: true });
  }
  
  if (!fs.existsSync(source)) {
    console.log(`❌ Source directory ${source} does not exist. Make sure to build the frontend first.`);
    process.exit(1);
  }

  copyRecursiveSync(source, destination);
  console.log('✅ Frontend successfully copied to public folder!');
} catch (err) {
  console.error('❌ Error copying frontend:', err);
  process.exit(1);
}
