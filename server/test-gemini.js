import axios from 'axios';
import 'dotenv/config';

async function testGeminiAPI() {
    console.log('Testing Gemini API with key:', process.env.GEMINI_API_KEY ? 'Found' : 'Missing');
    
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: `Generate exactly ONE compelling blog title for: "artificial intelligence in healthcare"

Rules:
- Return ONLY the title text
- No formatting, no quotes, no bullet points
- 40-60 characters max
- Make it engaging and SEO-friendly
- Include the main keywords naturally

Title:`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 50
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ SUCCESS! Gemini API Response:');
        console.log(JSON.stringify(response.data, null, 2));
        
        const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log('Generated title:', content);
        
    } catch (error) {
        console.log('❌ ERROR:');
        console.log('Status:', error.response?.status);
        console.log('Error data:', error.response?.data);
        console.log('Full error:', error.message);
    }
}

testGeminiAPI();