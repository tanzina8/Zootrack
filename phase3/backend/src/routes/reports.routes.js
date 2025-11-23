const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { requireAuth } = require("../middleware/auth");

// Custom JSON web service
router.get("/animal-summary", requireAuth, async (req, res) => {
    try {
    // query 1: count total animals
    const [total] = await pool.query("SELECT COUNT(*) AS total FROM animals");

    // query 2: count animals grouped by species
    const [species] = await pool.query(
        "SELECT species, COUNT(*) AS count FROM animals GROUP BY species"
    );

    res.json({
        total_animals: total[0].total,
        species_breakdown: species
    });

    } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
