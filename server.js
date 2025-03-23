// Load environment variables
require('dotenv').config();

// Import required modules
const express = require('express');
const axios = require('axios');
const path = require('path');

// Create an Express app
const app = express();

// Define GitHub OAuth credentials
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL;

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Route: Homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route: Redirect to GitHub for authentication
app.get('/auth/github', (req, res) => {
    const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${GITHUB_CALLBACK_URL}`;
    res.redirect(url);
});

// Route: Handle GitHub callback
app.get('/auth/github/callback', async (req, res) => {
    const { code } = req.query;

    try {
        // Exchange code for access token
        const { data } = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code,
            },
            {
                headers: { Accept: 'application/json' },
            }
        );

        const accessToken = data.access_token;

        // Fetch user data using the access token
        const { data: user } = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        // Display user data
        res.send(`
            <h1>Login Successful!</h1>
            <p>Welcome, ${user.name} (${user.login})!</p>
            <img src="${user.avatar_url}" alt="Profile Picture" width="100">
        `);
    } catch (error) {
        res.status(500).send('Something went wrong!');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});