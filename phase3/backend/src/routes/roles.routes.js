const router = require('express').Router();
const pool = require('../config/db');
const { requireAuth, requireRole } = require('../middleware/auth');

// admin can access all
router.get('/', requireAuth, requireRole('admin'), async (req, res, next) => {
    try {
    const [rows] = await pool.query('SELECT role_id, role_name FROM roles');
    res.json(rows);
    } catch (err) {
    next(err);
    }
});

module.exports = router;
