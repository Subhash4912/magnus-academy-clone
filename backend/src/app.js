const express = require('express');
const cors = require('cors');
const { clientOrigin } = require('./config/env');
const apiRoutes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: clientOrigin }));
app.use(express.json());
app.use('/api', apiRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
