const express = require('express');

const forecasts = require('./forecasts');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏'
  });
});

router.use('/forecasts', forecasts);

module.exports = router;
