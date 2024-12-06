const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate secure random strings
const generateSecret = (bytes = 32) => {
    return crypto.randomBytes(bytes).toString('hex');
};

// Generate secrets
const jwtSecret = generateSecret(32);
const sessionSecret = generateSecret(32);

// Read .env.example and create .env with generated secrets
const serverEnvPath = path.join(__dirname, '..', '.env');
const serverEnvExamplePath = path.join(__dirname, '..', '.env.example');

let envContent = fs.readFileSync(serverEnvExamplePath, 'utf8');

// Replace placeholder secrets with generated ones
envContent = envContent.replace(/your_jwt_secret_here/g, jwtSecret);
envContent = envContent.replace(/your_session_secret_here/g, sessionSecret);

// Write the new .env file
fs.writeFileSync(serverEnvPath, envContent);

console.log('\x1b[32m%s\x1b[0m', 'Secrets generated successfully!');
console.log('\x1b[36m%s\x1b[0m', '\nGenerated secrets:');
console.log('JWT_SECRET:', jwtSecret);
console.log('SESSION_SECRET:', sessionSecret);
console.log('\n\x1b[33m%s\x1b[0m', 'These secrets have been automatically added to your .env file.');
console.log('\x1b[33m%s\x1b[0m', 'Make sure to keep these secrets safe and never commit them to version control!');
