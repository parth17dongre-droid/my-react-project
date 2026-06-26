const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('better-sqlite3');
const cookieParser = require('cookie-parser');

const JWT_SECRET = 'your_jwt_secret_key'; 
const app = express();
const db = new sqlite3('database.db');

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5174');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Allow-Headers');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());
app.use(cookieParser());

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    hashedpassword TEXT NOT NULL,
    email TEXT NOT NULL,
    refresh_token TEXT
  )
`).run();

app.post('/refresh', async (req, res) => {
    const refresh_token = req.cookies.refresh_token;
    if (!refresh_token) {
        return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    try {
        const decoded = jwt.verify(refresh_token, JWT_SECRET);
        const username = decoded.username;

        const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
        const user = stmt.get(username);

        if (!user || user.refresh_token !== refresh_token) {
            return res.status(403).json({ success: false, message: 'Invalid refresh token' });
        }

        const new_access_token = jwt.sign({ username }, JWT_SECRET, { expiresIn: 60 });
        
        res.cookie('access_token', new_access_token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 60 * 1000 });
        return res.json({ success: true });
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
    }
});

app.get('/protected', async (req, res) => {
    const token = req.cookies?.access_token;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Missing token context.' });
    }

    try {
        jwt.verify(token, JWT_SECRET);
        return res.json({ success: true, message: 'Access granted to protected route' });
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Invalid token signature.' });
    }
});
app.get('/', async (req, res) => {
    res.send('Login using username and password');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username);

    if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.hashedpassword);
    if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid username or password' });
    }

    const payload = { username };
    const access_token = jwt.sign(payload, JWT_SECRET, { expiresIn: 60 });
    const refresh_token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
    
    const updateStmt = db.prepare('UPDATE users SET refresh_token = ? WHERE id = ?');
    updateStmt.run(refresh_token, user.id);
    
    res.cookie('access_token', access_token, { 
        httpOnly: true, 
        secure: false, 
        sameSite: 'lax', 
        domain: 'localhost',
        path: '/',
        maxAge: 60 * 1000 
    });
    
    res.cookie('refresh_token', refresh_token, { 
        httpOnly: true, 
        secure: false, 
        sameSite: 'lax', 
        domain: 'localhost',
        path: '/',
        maxAge: 30 * 24 * 60 * 60 * 1000 
    });

    return res.json({ success: true, message: 'Login Successful' });
});

app.post('/signup', async (req, res) => {
    const { username, password, email } = req.body;
    
    if(password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }
    if(!/\d/.test(password)) {
        return res.status(400).json({ success: false, message: 'Password must contain at least one number' });
    }
    if(!/[a-zA-Z]/.test(password)) {
        return res.status(400).json({ success: false, message: 'Password must contain at least one letter' });
    }

    try {
        const hashedpassword = await bcrypt.hash(password, 10);
        
        const payload = { username };
        const access_token = jwt.sign(payload, JWT_SECRET, { expiresIn: 60 });
        const refresh_token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

        const stmt = db.prepare(`
            INSERT INTO users (username, hashedpassword, email, refresh_token) 
            VALUES (?, ?, ?, ?)
        `);
        stmt.run(username, hashedpassword, email, refresh_token);

        res.cookie('access_token', access_token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 60 * 1000 });
        res.cookie('refresh_token', refresh_token, { httpOnly: true, secure: false, sameSite: 'lax', maxAge: 30 * 24 * 60 * 60 * 1000 });

        return res.json({ success: true, message: 'Signup successful' });

    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(400).json({ success: false, message: 'Username already exists' });
        }
        console.error("Error during signup:", error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

app.get('/auth-check', async (req, res) => {
    console.log("\n--- [AUTH-CHECK] HIT ---");
    console.log("Cookies received:", req.cookies);

    const access_token = req.cookies?.access_token;

    if (access_token) {
        try {
            jwt.verify(access_token, JWT_SECRET);
            console.log("✅ Access token is VALID.");
            return res.json({ success: true, message: 'User is authenticated' });
        } catch (error) {
            console.log(`❌ Access token failed. Error Name: ${error.name} | Message: ${error.message}`);
            if (error.name !== 'TokenExpiredError') {
                return res.status(403).json({ success: false, message: 'Invalid token' });
            }
        }
    } else {
        console.log("⚠️ No access token found in cookies.");
    }

    console.log("🔄 Attempting Token Rotation via Refresh Token...");
    const refresh_token = req.cookies?.refresh_token;
    if (!refresh_token) {
        console.log("❌ No refresh token found in cookies. Session dead.");
        return res.status(401).json({ success: false, message: 'Session expired' });
    }

    try {
        const decoded = jwt.verify(refresh_token, JWT_SECRET);
        const username = decoded.username;
        console.log(`Checking DB for user: ${username}`);

        const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
        const user = stmt.get(username);

        if (!user || user.refresh_token !== refresh_token) {
            console.log("❌ DB refresh token mismatch or user not found.");
            return res.status(403).json({ success: false, message: 'Session hijacked' });
        }

        console.log("🚀 Refresh token VALID. Generating new access token...");
        const new_access_token = jwt.sign({ username }, JWT_SECRET, { expiresIn: 60 });
        
        res.cookie('access_token', new_access_token, { 
            httpOnly: true, 
            secure: false, 
            sameSite: 'lax', 
            domain: 'localhost',
            path: '/',
            maxAge: 60 * 1000 
        });

        console.log("✅ New access token cookie attached successfully.");
        return res.json({ success: true, message: 'Token rotated successfully' });
    } catch (error) {
        console.log(`❌ Refresh token validation crashed: ${error.message}`);
        return res.status(403).json({ success: false, message: 'Session expired' });
    }
});

app.post('/logout', async (req, res) => {
    const refresh_token = req.cookies?.refresh_token;
    if (refresh_token) {
        try {
            const decoded = jwt.verify(refresh_token, JWT_SECRET);
            const username = decoded.username;

            const stmt = db.prepare('UPDATE users SET refresh_token = NULL WHERE username = ? AND refresh_token = ?');
            stmt.run(username, refresh_token);
        } catch (error) {
            console.error("Error during logout token verification:", error);
        }
    }

    res.clearCookie('access_token', { httpOnly: true, secure: false, sameSite: 'lax', domain: 'localhost', path: '/' });
    res.clearCookie('refresh_token', { httpOnly: true, secure: false, sameSite: 'lax', domain: 'localhost', path: '/' });

    return res.json({ success: true, message: 'Logged out successfully' });
});
app.listen(3000, () => {
    console.log("Server started on port 3000");
});