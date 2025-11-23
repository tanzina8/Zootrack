const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// Get all animals
router.get('/', async (req, res, next) => {
    try {
        const [rows] = await pool.query('SELECT * FROM animals');
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// Get animal by id
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.query('SELECT * FROM animals WHERE animal_id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Animal not found' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
});

// Add animal (admin and vet)
router.post('/', requireAuth, async (req, res, next) => {
    try {
        const role = req.session.user.role.toLowerCase();
        if (role !== "admin" && role !== "veterinarian") {
            return res.status(403).json({ error: "Forbidden: insufficient role" });
        }

        const { name, species, birth_date, sex, current_health_status, habitat_id } = req.body;

        if (!name || !species || !birth_date || !sex || !current_health_status || !habitat_id)
            return res.status(400).json({ error: 'Missing required fields' });

        const sql = `
            INSERT INTO animals (name, species, birth_date, sex, current_health_status, habitat_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const [result] = await pool.query(sql, [
            name, species, birth_date, sex, current_health_status, habitat_id
        ]);

        res.json({ success: true, animal_id: result.insertId });

    } catch (err) {
        next(err);
    }
});

// update animal (admin and vet)
router.put('/:id', requireAuth, async (req, res, next) => {
    try {
        const role = req.session.user.role.toLowerCase();
        if (role !== "admin" && role !== "veterinarian") {
            return res.status(403).json({ error: "Forbidden: insufficient role" });
        }

        const { id } = req.params;
        const { name, species, birth_date, sex, current_health_status, habitat_id } = req.body;

        const sql = `
            UPDATE animals
            SET name=?, species=?, birth_date=?, sex=?, current_health_status=?, habitat_id=?
            WHERE animal_id=?
        `;

        const [result] = await pool.query(sql, [
            name, species, birth_date, sex, current_health_status, habitat_id, id
        ]);

        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Animal not found' });

        res.json({ success: true });

    } catch (err) {
        next(err);
    }
});

// Delete animal (admin only)
router.delete('/:id', requireAuth, async (req, res, next) => {
    try {
        const role = req.session.user.role.toLowerCase();
        if (role !== "admin") {
            return res.status(403).json({ error: "Forbidden: insufficient role" });
        }

        const { id } = req.params;

        const [result] = await pool.query('DELETE FROM animals WHERE animal_id = ?', [id]);

        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Animal not found' });

        res.json({ success: true });

    } catch (err) {
        next(err);
    }
});

module.exports = router;
