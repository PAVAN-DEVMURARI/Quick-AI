import sql from '../configs/db.js';
import { clerkClient } from '@clerk/express';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import FormData from 'form-data';

// Alternative direct Gemini API function
async function callGeminiDirect(prompt) {
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 100
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('Direct Gemini Response:', JSON.stringify(response.data, null, 2));
        return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
        console.error('Direct Gemini API error:', error.response?.data || error.message);
        throw error;
    }
}

// Fallback function for when ClipDrop API fails
async function generatePlaceholderImage(prompt) {
    try {
        // Option 1: Use a placeholder image service with the prompt
        const encodedPrompt = encodeURIComponent(prompt.slice(0, 100)); // Limit prompt length
        const placeholderUrl = `https://via.placeholder.com/512x512/6366f1/white?text=${encodedPrompt}`;
        
        // Upload placeholder to Cloudinary for consistency
        const {secure_url} = await cloudinary.uploader.upload(placeholderUrl, {
            folder: 'ai-generated-placeholders'
        });
        
        return secure_url;
    } catch (error) {
        console.error('Placeholder generation failed:', error);
        // Return a simple placeholder URL as last resort
        return `https://via.placeholder.com/512x512/6366f1/white?text=AI+Generated+Image`;
    }
}

export const generateArticle = async (req, res) => {
    // Simplified version: generate once with only the provided prompt. No range enforcement,
    // no expansion passes, no trimming. Returns raw model output (trimmed for surrounding whitespace only).
    try {
        const { userId } = req.auth();
        const { prompt } = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium' && free_usage >= 10) {
            return res.json({ success: false, message: 'Free usage limit reached , Upgrade to continue' });
        }

        if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
            return res.json({ success: false, message: 'Prompt is required' });
        }

        const response = await callGeminiDirect(prompt.trim());
        const content = response;

        if (!content) {
            return res.json({ success: false, message: 'Model returned empty content. Try another prompt.' });
        }

        await sql`INSERT INTO creations (user_id, prompt, type, content) VALUES (${userId}, ${prompt}, 'article', ${content})`;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, {
                privateMetadata: { free_usage: free_usage + 1 }
            });
        }

        return res.json({ success: true, content, meta: null });
    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: error.message });
    }
};


//for blog title generation
export const generateBlogTitle = async (req,res) => {
    try{
        const {userId} = req.auth();
        const {prompt} = req.body;
        const plan = req.plan;
        const free_usage = req.free_usage;

        if (plan !== 'premium'&& free_usage >= 10)
        {
            return res.json({success: false, message: 'Free usage limit reached , Upgrade to continue'});
        }

        if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
            return res.json({ success: false, message: 'Prompt is required' });
        }

        // Enhanced prompt for generating 5 blog titles
        const enhancedPrompt = `Generate exactly 5 compelling blog titles for: "${prompt.trim()}"

Rules:
- Return 5 different titles, each on a new line
- Number each title (1. 2. 3. 4. 5.)
- 40-60 characters max per title
- Make them engaging and SEO-friendly
- Include the main keywords naturally
- No extra formatting or quotes

Example format:
1. First amazing title here
2. Second creative title here
3. Third engaging title here
4. Fourth catchy title here
5. Fifth compelling title here`

        // Retry logic for empty responses
        let content = '';
        let finishReason = '';
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts && !content) {
            attempts++;
            console.log(`=== BlogTitle Attempt ${attempts} ===`);
            console.log('Enhanced prompt:', enhancedPrompt);
            
            try {
                // Try direct Gemini API first
                if (attempts === 1) {
                    console.log('Trying direct Gemini API...');
                    try {
                        let rawContent = await callGeminiDirect(enhancedPrompt);
                        console.log('Direct API raw content:', rawContent);
                        
                        // Clean up the content - extract 5 titles
                        if (rawContent) {
                            // Remove markdown formatting
                            rawContent = rawContent.replace(/\*\*/g, '').replace(/\*/g, '');
                            // Split into lines and extract numbered titles
                            const lines = rawContent.split('\n').filter(line => line.trim());
                            const titles = [];
                            
                            for (const line of lines) {
                                // Match numbered titles like "1. Title here" or "1) Title here"
                                const match = line.match(/^(\d+)[\.\)]\s*(.+)$/);
                                if (match && match[2].trim().length > 10) {
                                    titles.push(match[2].trim());
                                }
                            }
                            
                            console.log('Extracted titles:', titles);
                            if (titles.length >= 3) { // Accept if we have at least 3 titles
                                content = titles; // Return array of titles
                                finishReason = 'stop';
                                break;
                            }
                        }
                    } catch (directError) {
                        console.log('Direct API failed, trying OpenAI compatibility...');
                    }
                }
                
                // Fallback to direct Gemini API
                console.log('Using direct Gemini API for blog titles...');
                const systemPrompt = 'You are an expert blog title generator. Always respond with exactly 5 numbered blog titles for the following topic: ';
                const rawContent = await callGeminiDirect(systemPrompt + enhancedPrompt);
                finishReason = 'stop';
                
                // Extract multiple titles from Gemini response
                if (rawContent && !Array.isArray(content)) {
                    const lines = rawContent.split('\n').filter(line => line.trim());
                    const titles = [];
                    
                    for (const line of lines) {
                        // Match numbered titles like "1. Title here" or "1) Title here"
                        const match = line.match(/^(\d+)[\.\)]\s*(.+)$/);
                        if (match && match[2].trim().length > 10) {
                            titles.push(match[2].trim());
                        }
                    }
                    
                    if (titles.length >= 3) { // Accept if we have at least 3 titles
                        content = titles;
                    } else {
                        content = rawContent; // fallback to original content
                    }
                }
                
                console.log('Extracted content:', content);
                console.log('Finish reason:', finishReason);

                if (!content && attempts < maxAttempts) {
                    console.warn(`BlogTitle: Empty content on attempt ${attempts}, retrying...`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // exponential backoff
                }
            } catch (apiError) {
                console.error(`BlogTitle API error on attempt ${attempts}:`, apiError);
                console.error('Full error details:', {
                    message: apiError.message,
                    status: apiError.status,
                    code: apiError.code,
                    type: apiError.type
                });
                if (attempts === maxAttempts) {
                    return res.json({ success: false, message: 'AI service temporarily unavailable. Please try again.' });
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
            }
        }

        if (!content) {
            console.warn('BlogTitle: Failed to generate content after all attempts. Raw prompt:', enhancedPrompt);
            return res.json({ success: false, message: 'Unable to generate titles. Please try a different keyword or try again later.' });
        }

        // Prepare content for database storage and response
        let dbContent, responseContent;
        if (Array.isArray(content)) {
            // Store all titles as JSON in database
            dbContent = JSON.stringify(content);
            responseContent = content; // Send array to frontend
        } else {
            // Fallback: single title
            dbContent = content;
            responseContent = [content]; // Wrap single title in array
        }

        try {
            await sql` INSERT INTO creations(user_id, prompt, type, content) VALUES (${userId}, ${prompt}, 'blog-title' , ${dbContent})`;
        } catch(dbErr) {
            console.error('DB insert failed for blog-title:', dbErr.message);
            return res.json({ success: false, message: 'Failed to save titles.' });
        }

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(userId, { privateMetadata:{free_usage: free_usage + 1} });
        }

        res.json({ success:true, titles: responseContent, content: responseContent[0], meta: { finish_reason: finishReason, count: responseContent.length } });
    }
    catch(error)
    {
        console.log(error.message);
        res.json ({success: false, message: error.message}); 
    }
}


//generate the image
export const generateImage = async (req,res) => {
    try{
        const {userId} = req.auth();
        const {prompt , publish} = req.body;
        const plan = req.plan;
        
        console.log('Generate Image Request - Publish:', publish, typeof publish);

        if (plan !== 'premium')
        {
            return res.json({success: false, message: 'Upgrade to continue'});
        }

        // Validate API key exists
        if (!process.env.CLIPDROP_API_KEY) {
            return res.json({success: false, message: 'Image generation service not configured'});
        }

        // Add prompt validation
        if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
            return res.json({success: false, message: 'Image prompt is required'});
        }

        console.log('Generating image with ClipDrop API...');
        console.log('Prompt:', prompt);

        try {
            //generate image
            const formData = new FormData();
            formData.append('prompt', prompt.trim());
            
            const response = await axios.post('https://clipdrop-api.co/text-to-image/v1', formData, {
                headers: {
                    'x-api-key': process.env.CLIPDROP_API_KEY,
                    ...formData.getHeaders()
                },
                responseType: "arraybuffer",
                timeout: 30000 // 30 second timeout
            });

            console.log('ClipDrop API response status:', response.status);
            
            const base64Image = `data:image/png;base64,${Buffer.from(response.data, 'binary').toString('base64')}`;

            console.log('Uploading to Cloudinary...');
            const {secure_url} = await cloudinary.uploader.upload(base64Image);
            console.log('Cloudinary upload success:', secure_url);

            //update in the database
            await sql` INSERT INTO creations(user_id, prompt, type, content , publish) VALUES (${userId}, ${prompt}, 'image', ${secure_url} , ${publish ?? false})`;

            res.json({success:true, secure_url});

        } catch (apiError) {
            console.error('ClipDrop API Error:', apiError.response?.status, apiError.response?.data);
            
            // Handle specific error codes
            if (apiError.response?.status === 402) {
                // Try alternative approach for 402 errors
                console.log('ClipDrop credits exhausted, trying alternative approach...');
                
                try {
                    // Generate a placeholder image URL or use a different service
                    const placeholderUrl = await generatePlaceholderImage(prompt);
                    
                    // Store in database
                    await sql` INSERT INTO creations(user_id, prompt, type, content , publish) VALUES (${userId}, ${prompt}, 'image', ${placeholderUrl} , ${publish ?? false})`;
                    
                    return res.json({
                        success: true, 
                        secure_url: placeholderUrl,
                        note: 'Generated using alternative method due to service limitations'
                    });
                } catch (fallbackError) {
                    return res.json({
                        success: false, 
                        message: 'Image generation service temporarily unavailable. Please try again later.'
                    });
                }
            } else if (apiError.response?.status === 401) {
                return res.json({
                    success: false, 
                    message: 'Invalid API key for image generation service.'
                });
            } else if (apiError.response?.status === 429) {
                return res.json({
                    success: false, 
                    message: 'Too many requests. Please wait a moment before trying again.'
                });
            } else if (apiError.code === 'ECONNABORTED') {
                return res.json({
                    success: false, 
                    message: 'Image generation timed out. Please try again.'
                });
            } else {
                return res.json({
                    success: false, 
                    message: `Image generation failed: ${apiError.response?.status || 'Unknown error'}`
                });
            }
        }


    }
    catch(error)
    {
        console.log(error.message);
        res.json ({success: false, message: error.message}); 
    }
}



//remove the background 
export const removeImageBackground = async (req,res) => {
    try{
        const {userId} = req.auth();
        const image = req.file; // memory storage: buffer
        const plan = req.plan;

        if (plan !== 'premium')
        {
            return res.json({success: false, message: 'Upgrade to continue'});
        }

        //generate image
        

        const base64Image = `data:${image.mimetype};base64,${image.buffer.toString('base64')}`;
        const {secure_url} =  await cloudinary.uploader.upload(base64Image,{
            transformation: [
                {
                    effect:'background_removal',
                    background_removal: 'remove the background'
                }
            ]
        })

        //update in the database
        await sql` INSERT INTO creations(user_id, prompt, type, content ) VALUES (${userId}, 'Remove background from the image', 'image', ${secure_url} )`;


        res.json({success:true , secure_url})


    }
    catch(error)
    {
        console.log(error.message);
        res.json ({success: false, message: error.message}); 
    }
}



//remove image object 
export const removeImageObject = async (req,res) => {
    try{
        const {userId} = req.auth();
        const {object} = req.body;
        const image = req.file; // memory storage
        const plan = req.plan;

        if (plan !== 'premium')
        {
            return res.json({success: false, message: 'Upgrade to continue'});
        }

        //remove the object
    const base64Image = `data:${image.mimetype};base64,${image.buffer.toString('base64')}`;
    const {public_id} =  await cloudinary.uploader.upload(base64Image)

        const image_url = cloudinary.url(public_id,{
            transformation: [{effect:`gen_remove:${object}`}],
            resource_type:'image'
        })

        //update in the database
        await sql` INSERT INTO creations(user_id, prompt, type, content ) VALUES (${userId}, ${`Removed ${object} from the image`}, 'image', ${image_url} )`;


        res.json({success:true , image_url})


    }
    catch(error)
    {
        console.log(error.message);
        res.json ({success: false, message: error.message}); 
    }
}



//resume review 
export const resumeReview = async (req,res) => {
    try{
        const {userId} = req.auth();
        const resume = req.file; // memory storage
        const plan = req.plan;

        if (plan !== 'premium')
        {
            return res.json({success: false, message: 'Upgrade to continue'});
        }

        //review the resume
        if (resume.size > 5 * 1024 * 1024)
        {
            return res.json({success: false, message: 'Resume is too large. Max size is 5MB'});
        }

        //convert the resume to databuffer
        const pdfData = await pdf(resume.buffer);
        const pdfText = pdfData.text;
        
        if (!pdfText || pdfText.trim().length < 50) {
            return res.json({success: false, message: 'Could not extract text from PDF. Please ensure it contains readable text.'});
        }

        const prompt = `Review my resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Here is my resume content: /n/n ${pdfText}`;

        // Use direct Gemini API call
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000
                }
            }
        );

        const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

        // Validate content before database insert
        if (!content || content.trim() === '') {
            return res.json({success: false, message: 'Failed to generate resume review. Please try again.'});
        }

        //update in the database
        await sql` INSERT INTO creations(user_id, prompt, type, content ) VALUES (${userId}, ${'Review the uploaded resume'}, 'resume-review', ${content} )`;

        res.json({success:true , content})


    }
    catch(error)
    {
        console.log(error.message);
        res.json ({success: false, message: error.message}); 
    }
}