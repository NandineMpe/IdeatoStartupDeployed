const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config({ path: '.env.local' });

const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_KEY) {
  console.error('❌ Error: OPENAI_API_KEY is not set in .env.local');
  process.exit(1);
}

console.log('🔑 Found OPENAI_API_KEY');

const configuration = new Configuration({
  apiKey: OPENAI_KEY,
});

const openai = new OpenAIApi(configuration);

async function testKey() {
  try {
    console.log('🔍 Testing key with models.list()...');
    const response = await openai.listModels();
    console.log('✅ Success! Your API key is valid.');
    console.log(`   Available models: ${response.data.data.length} models found`);
  } catch (error) {
    console.error('❌ Error testing API key:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data.error);
      
      if (error.response.status === 401) {
        console.error('\n🔐 Authentication Error: The provided API key is invalid or has been revoked');
      } else if (error.response.status === 429) {
        console.error('\n⚠️  Rate limit exceeded');
      }
    } else {
      console.error(error.message);
    }
  }
}

testKey();
