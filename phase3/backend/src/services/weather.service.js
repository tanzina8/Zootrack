const axios = require('axios');
const pool = require('../config/db');
const { OPENWEATHER_API_KEY } = require('../config/env');
console.log(' Weather service loaded. API key =', OPENWEATHER_API_KEY);


// fetch weather from OpenWeatherMap
async function fetchWeather(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    const response = await axios.get(url);
    const data = response.data;

    return {
    temperature: data.main.temp,
    humidity: data.main.humidity,
    condition: data.weather[0].description,
    };
}

// save weather data in db
async function saveWeather(habitat_id, weather) {
    const sql = `
    INSERT INTO weatherdata (habitat_id, temperature, humidity, \`condition\`, recorded_datetime)
    VALUES (?, ?, ?, ?, NOW())
    `;

    await pool.query(sql, [
    habitat_id,
    weather.temperature,
    weather.humidity,
    weather.condition,
    ]);
}

module.exports = { fetchWeather, saveWeather };

