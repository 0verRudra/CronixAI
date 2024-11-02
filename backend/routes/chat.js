// Import necessary packages
import express from 'express'; // Assuming you are using Express
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const app = express();
const PORT = 5000;

// Middleware to parse JSON
app.use(express.json());

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Route to handle chat messages
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        // Start chat history
        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: "Hello" }] },
                { role: "model", parts: [{ text: "Great to meet you. What would you like to know?" }] },
            ],
        });

        // Send the user message
        let result = await chat.sendMessage(message);
        const responseText = result.response.text();

        res.json({ response: responseText }); // Send response back to client
    } catch (error) {
        console.error('Error in chat route:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
