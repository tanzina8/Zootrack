const MySQLStore = require('express-mysql-session')(require('express-session'));
const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS } = require('./env');

const sessionStore = new MySQLStore({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    createDatabaseTable: true,
});

module.exports = sessionStore;
