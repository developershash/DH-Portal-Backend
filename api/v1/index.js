'use strict';

const express = require('express');
const userRouter = require('./users/users.routes');

const router = express();

router.use('/users', userRouter);

module.exports = router;