const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// export animals as CSV
router.get('/animals/csv', async (req, res, next) => {
    try {
    const [rows] = await pool.query('SELECT * FROM animals');
    const parser = new Parser();
    const csv = parser.parse(rows);

    res.header('Content-Type', 'text/csv');
    res.attachment('animals_export.csv');
    res.send(csv);
    } catch (err) {
    next(err);
    }
});

// export Weather as CSV
router.get('/weather/csv', async (req, res, next) => {
    try {
    const [rows] = await pool.query('SELECT * FROM weatherdata');
    const parser = new Parser();
    const csv = parser.parse(rows);

    res.header('Content-Type', 'text/csv');
    res.attachment('weather_export.csv');
    res.send(csv);
    } catch (err) {
    next(err);
    }
});


// Export Animals as PDF
router.get('/animals/pdf', async (req, res, next) => {
    try {
    const [rows] = await pool.query('SELECT * FROM animals');
    const doc = new PDFDocument({ margin: 40 });
    const filePath = path.join(__dirname, '../../animals_export.pdf');
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text('ZooTrack - Animal Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text('ID | Name | Species | Sex | Health | Habitat');
    doc.moveDown(0.5);

    rows.forEach(a => {
        doc.text(
        `${a.animal_id} | ${a.name} | ${a.species} | ${a.sex} | ${a.current_health_status} | ${a.habitat_id}`
        );
    });

    doc.end();

    stream.on('finish', () => {
        res.download(filePath, 'animals_export.pdf', () => {
        fs.unlinkSync(filePath);
        });
    });
    } catch (err) {
    next(err);
    }
});

// Export Weather as PDF
router.get('/weather/pdf', async (req, res, next) => {
    try {
    const [rows] = await pool.query('SELECT * FROM weatherdata');
    const doc = new PDFDocument({ margin: 40 });
    const filePath = path.join(__dirname, '../../weather_export.pdf');
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text('ZooTrack - Weather Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text('ID | Habitat | Temp | Humidity | Condition');
    doc.moveDown(0.5);

    rows.forEach(w => {
        doc.text(
        `${w.weather_id} | ${w.habitat_id} | ${w.temperature}°C | ${w.humidity}% | ${w.condition}`
        );
    });

    doc.end();

    stream.on('finish', () => {
        res.download(filePath, 'weather_export.pdf', () => {
        fs.unlinkSync(filePath);
        });
    });
    } catch (err) {
    next(err);
    }
});

module.exports = router;

