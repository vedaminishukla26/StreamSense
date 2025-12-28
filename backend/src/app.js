const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const authRoutes = require('./routes/authRoutes')

app.use(helmet());
app.use(cors()); 
app.use(express.json());
app.use(morgan('dev')); 
app.use('/api/auth', authRoutes)

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

module.exports = app;