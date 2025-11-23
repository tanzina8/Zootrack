const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { fetchWeather, saveWeather } = require('../services/weather.service');

router.get('/:city', async (req, res, next) => {
  try {
    const { city } = req.params;

    //  Fetch weather from API
    const weather = await fetchWeather(city);

    const habitat_id = 1;

    //Save to db
    await saveWeather(habitat_id, weather);

    // send response back to Postman
    res.json({
        success: true,
        city,
        ...weather,
    });
    } catch (err) {
    console.error(' Weather route error:', err.message);
    res.status(500).json({ error: 'ServerError', message: err.message });
    }
});

module.exports = router;


