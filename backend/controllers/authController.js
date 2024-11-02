const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    // Log the request body to see what data is being sent
    console.log('Request body:', req.body);

    // Check if all fields are present
    if (!username || !email || !password) {
        console.log('Missing fields');
        return res.status(400).json({ error: 'All fields (username, email, password) are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        console.error('Error in registration:', error);
        res.status(500).json({ error: 'User registration failed', details: error.message });
    }
};




// Login
exports.login = async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Set the token as a cookie
    res.cookie('token', token, {
        httpOnly: true, // Helps prevent XSS attacks
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        maxAge: 3600000 // Cookie expires in 1 hour
    });

    res.status(200).json({ message: 'Logged in successfully' });
};
