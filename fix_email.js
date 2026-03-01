const fs = require('fs');
let env = fs.readFileSync('.env', 'utf8');

// Remove duplicate EMAIL_USER - keep only the correct one
env = env.replace('EMAIL_USER=ganeshaddagiri6@gmail.com\n', '');

fs.writeFileSync('.env', env, 'utf8');
console.log('done');
console.log(env.match(/EMAIL.*/g));
