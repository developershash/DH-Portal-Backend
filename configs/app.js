'use strict';

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const mongoose = require('mongoose');

const CONFIGURATION = {
    DB_URI: process.env.DB_URI,
    ENV: process.env.NODE_ENV,
    PORT: process.env.PORT
};

mongoose.connect(CONFIGURATION.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});
mongoose.connection.once('open', function () {
    console.log(`MongoDB connected to ${CONFIGURATION.DB_URI}`);
})
mongoose.connection.on('error', function (err) {
    console.log('MongoDB Connection Error');
    process.exit(-1);
});

module.exports = { CONFIGURATION };