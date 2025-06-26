const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json'); //Reference to DATA_PATH needed fixing
const statsUtil = require('../utils/stats')

let stats = null
let lastModified = null
let modifiedTime = null

// GET /api/stats
router.get('/', (req, res, next) => {

  fs.stat(DATA_PATH, (err, info) => {
    if (err) return next(err);
    modifiedTime = info.mtimeMs;
  });

  if (stats && modifiedTime == lastModified) {
    return res.json(stats)
  }

  fs.readFile(DATA_PATH, (err, raw) => {
    if (err) return next(err);
    const items = JSON.parse(raw);
    // Intentional heavy CPU calculation
    stats = {
      total: items.length,
      averagePrice: statsUtil.mean(items.map(i => i.price)) // now passing containing item prices to utils function
    };

    lastModified = modifiedTime

    res.json(stats);
  });
});

module.exports = router;