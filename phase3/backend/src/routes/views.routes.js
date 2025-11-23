const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { requireAuth } = require('../middleware/auth');

// views from phase 2
const allowedViews = [
    'aboveaveragedonationvisitors',
    'animalhealthoverview',
    'animalvethabitatinfo',
    'donationoverview',
    'feedingscheduledetails',
    'habitatconditions',
    'latestcheckupperanimal',
    'visitor_donation_full',
    'visitorswithticketsordonations',
    'visitorticketsummary',
];

// get all views
router.get('/', requireAuth, (req, res) => {
    res.json({ available_views: allowedViews });
});

// Get data from specific view
router.get('/:viewName', requireAuth, async (req, res, next) => {
    try {
    const { viewName } = req.params;
    // role based access
const role = (req.session.user.role || "").toLowerCase();

// Vet allowed views
if (role === "veterinarian") {
    const vetAllowed = [
        "animalhealthoverview",
        "animalvethabitatinfo",
        "latestcheckupperanimal"
    ];
    if (!vetAllowed.includes(viewName.toLowerCase())) {
        return res.status(403).json({ error: "Veterinarians cannot access this view" });
    }
}

// Zookeeper allowed views
if (role === "zookeeper") {
    const keeperAllowed = [
        "feedingscheduledetails",
        "habitatconditions",
        "animalhealthoverview"
    ];
    if (!keeperAllowed.includes(viewName.toLowerCase())) {
        return res.status(403).json({ error: "Zookeepers cannot access this view" });
    }
}

// Admin full access
    if (!allowedViews.includes(viewName)) {
        return res.status(400).json({ error: 'Invalid or unauthorized view name' });
    }

    const [rows] = await pool.query(`SELECT * FROM ${viewName}`);
    res.json({ view: viewName, data: rows });
    } catch (err) {
    next(err);
    }
});

module.exports = router;

