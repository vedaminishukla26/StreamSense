const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');


const app = express();
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

const authRoutes = require('./routes/authRoutes')
const videoRoutes = require('./routes/videoRoutes')

app.use(helmet());
app.use(cors()); 
app.use(morgan('dev')); 

app.use('/api/auth', authRoutes)
app.use('/api/videos', videoRoutes)

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

module.exports = app;