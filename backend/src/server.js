require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createTables, seedData } = require('./seed');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'pulseboard-backend' });
});

// Routes
app.use('/api', routes);

// Initialize database and start server
async function start() {
  try {
    await createTables();
    await seedData();
    console.log('Database initialized');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
}

start();