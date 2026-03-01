const fs = require('fs');
let env = fs.readFileSync('.env', 'utf8');

// Remove all duplicate email lines - keep only one of each
const lines = env.split('\n');
const seen = {};
const clean = lines.filter(line => {
  const key = line.split('=')[0].trim();
  if (!key || key.startsWith('#')) return true;
  if (seen[key]) return false;
  seen[key] = true;
  return true;
});

env = clean.join('\n');
fs.writeFileSync('.env', env, 'utf8');
console.log('Cleaned .env:');
console.log(env.match(/EMAIL.*/g));
