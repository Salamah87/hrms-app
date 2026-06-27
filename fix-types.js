const fs = require('fs');
const path = require('path');

function walkDir(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) walkDir(fullPath);
    else if (file.name.endsWith('.tsx')) fixFile(fullPath);
  }
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Fix Record<SomeEnum, ...> to Record<string, ...>
  content = content.replace(/Record<\w+Status,/g, 'Record<string,');
  content = content.replace(/Record<\w+Type,/g, 'Record<string,');

  // Fix as unknown as Record<string, unknown>[] to as any[]
  content = content.replace(/as unknown as Record<string, unknown>\[\]/g, 'as any[]');

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Fixed:', path.relative(process.cwd(), filePath));
  }
}

walkDir(path.join(__dirname, 'src', 'app'));
console.log('Done');
