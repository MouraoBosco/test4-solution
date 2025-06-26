const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

//nNormalizes texts for comparsion within query 
function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accent marks
    .replace(/[^\w\s]/g, '');        // remove punctuation
}

// escape special characters for safe use in RegExp
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


// Utility to read data (intentionally sync to highlight blocking issue)
async function readData() {
  const raw = await fs.readFile(DATA_PATH);
  return JSON.parse(raw);
}

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    const { limit, q } = req.query;
    let results = data;

    if (q) {
      // Simple substring search (sub‑optimal)
      // Adding changes to the substring search to make sure it now normalizes text from query
      const cleanQuery = escapeRegex(normalize(q));
      const regex = new RegExp(`\\b${cleanQuery}`, 'i');

      results = results.filter(item =>
        regex.test(normalize(item.name)) ||
        regex.test(normalize(item.category))
      );
    }

    if (limit) {
      results = results.slice(0, parseInt(limit));
    }

    res.json(results);
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    // TODO: Validate payload (intentional omission)
    // now payload is going through basic validation
    const item = req.body;

    if (
      !item ||
      typeof item.name !== 'string' ||
      typeof item.price !== 'number' ||
      typeof item.category !== 'string'
    ) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const data = await readData();
    item.id = Date.now();
    data.push(item);
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;