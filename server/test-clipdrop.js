import axios from 'axios';
import FormData from 'form-data';
import 'dotenv/config';

async function testClipDropAPI() {
    console.log('Testing ClipDrop API...');
    console.log('API Key exists:', process.env.CLIPDROP_API_KEY ? 'Yes' : 'No');
    
    if (!process.env.CLIPDROP_API_KEY) {
        console.log('❌ CLIPDROP_API_KEY not found in environment variables');
        return;
    }
    
    try {
        const formData = new FormData();
        formData.append('prompt', 'a beautiful sunset over mountains');
        
        const response = await axios.post('https://clipdrop-api.co/text-to-image/v1', formData, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY,
                ...formData.getHeaders()
            },
            responseType: "arraybuffer",
            timeout: 30000
        });
        
        console.log('✅ SUCCESS! ClipDrop API is working');
        console.log('Response status:', response.status);
        console.log('Image size:', response.data.length, 'bytes');
        
    } catch (error) {
        console.log('❌ ClipDrop API Error:');
        console.log('Status:', error.response?.status);
        console.log('Status Text:', error.response?.statusText);
        console.log('Error Data:', error.response?.data?.toString());
        
        if (error.response?.status === 402) {
            console.log('🚨 This is a 402 Payment Required error');
            console.log('Possible causes:');
            console.log('- Your ClipDrop account has run out of credits');
            console.log('- Your subscription has expired');
            console.log('- The API key is associated with a free plan that has limits');
            console.log('Solution: Check your ClipDrop dashboard and upgrade your plan');
        } else if (error.response?.status === 401) {
            console.log('🚨 This is a 401 Unauthorized error');
            console.log('- Your API key is invalid or expired');
            console.log('- Check your ClipDrop dashboard for the correct API key');
        }
    }
}

testClipDropAPI();