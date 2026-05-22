const fs = require('fs');
const content = fs.readFileSync('src/app/pages/Landing.tsx', 'utf-8');

const lines = content.split('\n');
let stack = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // simple matching
  let m1 = line.match(/<motion\.div/g);
  let m2 = line.match(/<\/motion\.div>/g);
  let m3 = line.match(/<motion\.div[^>]*\/>/g); // self closing
  
  let opens = (m1 ? m1.length : 0) - (m3 ? m3.length : 0);
  let closes = (m2 ? m2.length : 0);
  
  for(let j=0; j<opens; j++) stack.push(i+1);
  for(let j=0; j<closes; j++) stack.pop();
}

console.log("Unclosed tags opened at lines: ", stack);
