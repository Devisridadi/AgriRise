const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const predictionRoutes = require('./routes/predictionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', predictionRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.send('AgrirIse Backend API is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
