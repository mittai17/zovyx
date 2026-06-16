import fs from 'fs';
import path from 'path';

const directory = '/home/mittai/Documents/vs/Zuvix/zuvix-agent';

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  let newContent = content;

  // Replace Zuvix -> Zuvix
  newContent = newContent.replace(/Zuvix/g, 'Zuvix');
  // Replace zuvix -> zuvix
  newContent = newContent.replace(/zuvix/g, 'zuvix');
  // Replace Zuvix -> Zuvix
  newContent = newContent.replace(/Zuvix/g, 'Zuvix');
  // Replace zuvix -> zuvix
  newContent = newContent.replace(/zuvix/g, 'zuvix');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === 'dist' || file === '.git' || file === 'pnpm-lock.yaml') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else {
      // only process text files
      if (/\.(ts|js|md|json|yaml|yml|tsx|jsx|txt|html|css|mjs)$/i.test(file)) {
        processFile(fullPath);
      }
    }
  }
}

walkDir(directory);
console.log('Rebranding complete!');
