const axios = require('axios');

const notFound = (req, res, next) => {
  const err = new Error('Route Not Found');
  err.status = 404;
  next(err);
};

// Express error-handling middleware
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  console.error('Error:', message);
  res.status(status).json({ error: message });
};

const getCookie = async () => {
  // Use the local mock server
  const response = await axios.get('http://localhost:4000/api/token');
  return response.data;
};

module.exports = { getCookie, notFound, errorHandler };