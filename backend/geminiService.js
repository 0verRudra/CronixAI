const axios = require('axios');

const GEMINI_API_URL = 'https://api.gemini.com/v1'; // Replace with the actual API endpoint
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Store your API key in .env

const geminiApi = axios.create({
    baseURL: GEMINI_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-GEMINI-APIKEY': GEMINI_API_KEY,
    },
});

// Function to send a message to the Gemini API and get a response
const sendMessageToGemini = async (message) => {
    try {
        const response = await geminiApi.post('/chat', { message });
        return response.data;
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw new Error('Gemini API error');
    }
};

module.exports = { sendMessageToGemini };
