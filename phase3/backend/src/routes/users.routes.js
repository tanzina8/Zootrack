const router = require('express').Router();
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

// list all users for postman testing
router.get('/', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
        const [rows] = await pool.query(
        'SELECT user_id, first_name, last_name, phone_number, role_id FROM users'
    );
    res.json(rows);
    } catch (err) {
    next(err);
    }
});

module.exports = router;
