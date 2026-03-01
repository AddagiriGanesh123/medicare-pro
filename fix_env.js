const fs = require('fs');
let env = fs.readFileSync('.env', 'utf8');
env = env.replace(/MAILGUN_API_KEY=.*\n?/g, '');
env += '\nMAILGUN_API_KEY=34cee7a6e60166fed43312f0fff08f0f-58d4d6a2-e7bc79e2\n';
fs.writeFileSync('.env', env, 'utf8');
console.log('Fixed!');
require('dotenv').config();
console.log('KEY:', process.env.MAILGUN_API_KEY);
