const express = require('express');
const app = express();

const userRoutes = require('./routes/userRoutes');
const providerRoutes = require('./routes/providerRoutes');

app.use(express.json()); // important for POST JSON bodies

// Mount the routes
app.use('/api/users', userRoutes);
app.use('/api/providers', providerRoutes);

module.exports = app;

