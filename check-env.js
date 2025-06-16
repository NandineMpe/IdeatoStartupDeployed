const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');

console.log('🔍 Checking for .env.local file...');

// Check if .env.local exists
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env.local file not found in the project root');
  console.log('\nPlease create a .env.local file in your project root with:');
  console.log('\nOPENAI_API_KEY=your_openai_api_key_here\n');
  process.exit(1);
}

console.log('✅ Found .env.local file');

// Read the file
const envContent = fs.readFileSync(envPath, 'utf8');

// Check if OPENAI_API_KEY is in the file
if (!envContent.includes('OPENAI_API_KEY')) {
  console.error('❌ Error: OPENAI_API_KEY not found in .env.local');
  console.log('\nPlease add this line to your .env.local file:');
  console.log('\nOPENAI_API_KEY=your_openai_api_key_here\n');
  process.exit(1);
}

console.log('✅ Found OPENAI_API_KEY in .env.local');

// Show a masked version of the key
const keyLine = envContent.split('\n').find(line => line.startsWith('OPENAI_API_KEY='));
if (keyLine) {
  const keyValue = keyLine.split('=')[1];
  const maskedKey = keyValue ? 
    `${keyValue.substring(0, 4)}...${keyValue.substring(keyValue.length - 4)}` : 
    '(empty)';
  console.log(`🔑 Detected key: ${maskedKey}`);
}

console.log('\n✅ Environment check complete');
console.log('💡 If you\'re still having issues, please verify:');
console.log('1. The key is valid and hasn\'t been revoked');
console.log('2. Your account has sufficient credits');
console.log('3. There are no typos in the key');
console.log('4. The key has the necessary permissions');
