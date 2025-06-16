const fetch = require('node-fetch');

async function testEndpoint() {
  try {
    const response = await fetch('http://localhost:3000/api/openai-idea-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ideaDescription: "A mobile app that helps people find local farmers markets and buy fresh produce directly from local farmers.",
        proposedSolution: "An app with geolocation to find nearby farmers markets, vendor listings, product availability, and in-app purchases.",
        intendedUsers: "Health-conscious consumers, local food enthusiasts, and people who want to support local agriculture.",
        geographicFocus: "Urban and suburban areas in the United States"
      })
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testEndpoint();
