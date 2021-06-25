'use strict';

const { ENV, PORT } = require('./configs/app').CONFIGURATION;
const express = require('express');

const app = express();

require('./configs/express')(app);
require('./configs/routes')(app);

app.listen(PORT, () => {
    console.log(`Express server is listening on port ${PORT} in ${ENV} environment`);
});