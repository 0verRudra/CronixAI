const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
connectDB();

// Enable CORS for the frontend
app.use(cors({
    origin: 'http://localhost:5001',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Add this
}));


app.use(express.json());
app.use(cookieParser()); // Use cookie-parser before your routes
app.use(express.static('../frontend')); // Ensure this is the correct path for serving static files

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    const token = req.cookies.token; // Access the token from cookies

    if (!token) return res.sendStatus(403); // No token, access denied

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Invalid token, access denied
        req.user = user; // Attach user info to the request object
        next(); // Proceed to the next middleware or route
    });
}

// Serve pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'register.html'));
});

app.get('/chat', isAuthenticated, (req, res) => { // Protect chat route
    res.sendFile(path.join(__dirname, '../frontend', 'chat.html'));
});

// Define API routes
app.use('/api/auth', authRoutes); // Ensure authRoutes is defined properly

// Google Generative AI integration
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.post('/api/chat', isAuthenticated, async (req, res) => {
    try {
        const { message } = req.body;

        const chat = model.startChat();
        const result = await chat.sendMessage(message);

        res.json({ response: result.response.text() });
    } catch (error) {
        console.error('Error in chat route:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

app.get('/logout', (req, res) => {
    // Clear the token cookie
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully.' });
});

// Start server
app.listen(5001, () => {
    console.log('Server is running on port 5001'); // Correct the port here
});
