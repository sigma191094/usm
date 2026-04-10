const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, '../../web/src/app/admin');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

let modified = 0;

walkDir(adminDir, (filePath) => {
    if (!filePath.endsWith('.tsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Pattern 1: gridTemplateColumns: '1fr 1fr' -> 'repeat(auto-fit, minmax(280px, 1fr))' 
    // This allows forms to break to 1 column on mobile gracefully.
    content = content.replace(/gridTemplateColumns:\s*['"]1(.\w+)?fr\s+1fr['"]/g, "gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'");
    
    // Pattern 2: '1fr 1fr 1fr' or similar grids
    content = content.replace(/gridTemplateColumns:\s*['"]1fr\s+1fr\s+1fr['"]/g, "gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'");

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        modified++;
        console.log('Fixed', path.basename(filePath));
    }
});

console.log(`Modified ${modified} files.`);
