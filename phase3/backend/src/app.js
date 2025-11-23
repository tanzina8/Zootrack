const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { SESSION_SECRET } = require('./config/env');

const sessionStore = require('./config/sessionStore');

const app = express();

app.use(helmet());
app.use(morgan('dev'));

const cors = require('cors');

app.use(cors({
    origin: "http://localhost:4000",
    credentials: true
}));

app.use(express.json());

// mysql store
app.use(session({
    name: "sid",
    secret: SESSION_SECRET || "dev-secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        path: "/"
    }
}));



// for frontened folder
const FRONTEND_PATH = path.join(__dirname, '../../frontend');
console.log("Serving frontend from:", FRONTEND_PATH);

app.use(express.static(FRONTEND_PATH));


// API routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/users.routes'));
app.use('/api/roles', require('./routes/roles.routes'));
app.use('/api/animals', require('./routes/animals.routes'));
app.use('/api/views', require('./routes/views.routes'));
app.use('/api/weather', require('./routes/weather.routes'));
app.use('/api/export', require('./routes/export.routes'));
app.use("/api/reports", require("./routes/reports.routes"));


app.use((req, res) => res.status(404).json({ error: 'NotFound' }));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'ServerError', message: err.message });
});

module.exports = app;



