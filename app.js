const express = require('express');
const router = require('./router');

// 创建web应用
const app = express();
router(app);

module.exports = app;