const router = require('express').Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { requireAuth } = require('../middleware/auth');

// register tested in postman
router.post('/register', async (req, res, next) => {
    try {
        const { first_name, last_name, phone_number, password, role_id = 2, sex = 'Other' } = req.body;

        if (!first_name || !last_name || !phone_number || !password)
            return res.status(400).json({ error: 'Missing fields' });

        const [exists] = await pool.query(
            'SELECT * FROM users WHERE phone_number = ?',
            [phone_number]
        );
        if (exists.length > 0)
            return res.status(409).json({ error: 'User already exists' });

        const hashed = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            `INSERT INTO users (first_name, last_name, password, role_id, phone_number, sex) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [first_name, last_name, hashed, role_id, phone_number, sex]
        );

        res.json({ success: true, user_id: result.insertId });
    } catch (err) {
        next(err);
    }
});

// Login
router.post('/login', async (req, res, next) => {
    try {
        const { phone_number, password } = req.body;

        // phone number has to be only number
        if (!/^\d+$/.test(phone_number)) {
            return res.status(400).json({ error: "Phone number must contain numbers only" });
        }

        const [[user]] = await pool.query(
            'SELECT * FROM users WHERE phone_number = ?',
            [phone_number]
        );

        if (!user)
            return res.status(401).json({ error: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(401).json({ error: 'Invalid credentials' });

        const [[role]] = await pool.query(
            'SELECT role_name FROM roles WHERE role_id = ?',
            [user.role_id]
        );

        req.session.user = {
            user_id: user.user_id,
            name: `${user.first_name} ${user.last_name}`,
            role: role ? role.role_name : "user"
        };

        // send cookie
        res.cookie("sid", req.sessionID, {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        });

        return res.json({ success: true, user: req.session.user });

    } catch (err) {
        next(err);
    }
});

// frontend session check
router.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: "Unauthenticated" });
    }
    res.json({
        authenticated: true,
        user: req.session.user
    });
});

// logout
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("sid");
        res.json({ success: true });
    });
});

module.exports = router;

