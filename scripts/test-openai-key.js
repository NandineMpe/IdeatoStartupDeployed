const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_KEY) {
  console.error('❌ Error: OPENAI_API_KEY is not set in .env.local');
  process.exit(1);
}

console.log('🔑 Found OPENAI_API_KEY');
console.log('🔍 Testing key against OpenAI API...');

const openai = new OpenAI({
  apiKey: OPENAI_KEY,
  timeout: 10000,
});

async function testKey() {
  try {
    // Test 1: List models (lightweight request)
    console.log('\n🔌 Testing API key with models.list()...');
    const models = await openai.models.list();
    console.log('✅ Successfully connected to OpenAI API');
    console.log(`   Available models: ${models.data.length} models found`);
    
    // Test 2: Test chat completion (more comprehensive test)
    console.log('\n🧪 Testing chat completion...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say this is a test' }],
      max_tokens: 5,
    });
    
    console.log('✅ Chat completion test successful');
    console.log('   Response:', JSON.stringify(completion.choices[0].message, null, 2));
    
    console.log('\n🎉 OpenAI API key is valid and working!');
    
  } catch (error) {
    console.error('\n❌ Error testing OpenAI API key:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      
      if (error.response.status === 401) {
        console.error('\n🔐 Authentication Error: The provided API key is invalid or has been revoked');
        console.error('Please check your OPENAI_API_KEY in .env.local');
      } else if (error.response.status === 429) {
        console.error('\n⚠️  Rate limit exceeded. You might have hit the API rate limit.');
      }
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n⏱️  Connection timeout. Please check your internet connection.');
    } else {
      console.error(error);
    }
    
    process.exit(1);
  }
}

testKey();
