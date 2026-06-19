const fs = require('fs');
const file = 'src/data/algeria_regions.ts';
let data = fs.readFileSync(file, 'utf8');
data = data.replace(/baseShipping: number;/g, 'homeShipping: number;\n  officeShipping: number;');
data = data.replace(/baseShipping:\s*(\d+)/g, (match, p1) => {
  const p = parseInt(p1);
  return `officeShipping: ${p}, homeShipping: ${p + 200}`;
});
fs.writeFileSync(file, data);
