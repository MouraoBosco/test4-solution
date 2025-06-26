const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json'); //Reference to DATA_PATH needed fixing
const statsUtil = require('../utils/stats')

let stats = null
let lastModified = null
let modifiedTime = null

// GET /api/stats
router.get('/', async (req, res, next) => {

  try {
    modifiedTime = (await fs.stat(DATA_PATH)).mtimeMs

    if (stats && modifiedTime == lastModified) {
      return res.json(stats)
    }

    const raw = await fs.readFile(DATA_PATH);
    const items = JSON.parse(raw);

    stats = {
      total: items.length,
      averagePrice: statsUtil.mean(items.map(i => i.price)) // now passing containing item prices to utils function
    };

    lastModified = modifiedTime

    res.json(stats);

  } catch (err) {
    next(err)
  }
});

module.exports = router;