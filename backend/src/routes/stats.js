const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json'); //Reference to DATA_PATH needed fixing
const statsUtil = require('../utils/stats')

// GET /api/stats
router.get('/', (req, res, next) => {
  fs.readFile(DATA_PATH, (err, raw) => {
    if (err) return next(err);

    const items = JSON.parse(raw);
    // Intentional heavy CPU calculation
    const stats = {
      total: items.length,
      averagePrice: statsUtil.mean(items.map(i => i.price)) // now passing containing item prices to utils function
    };

    res.json(stats);
  });
});

module.exports = router;