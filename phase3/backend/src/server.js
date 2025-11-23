const { PORT } = require('./config/env');
const app = require('./app');

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
