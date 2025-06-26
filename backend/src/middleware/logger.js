const fs = require('fs').promises;
const path = require('path');

const logDirectory = path.join(__dirname, '../../logs');

async function ensureLogDirectory() {
  try {
    await fs.mkdir(logDirectory, { recursive: true });
  } catch (err) {
    console.error('Failed to create log directory:', err.message);
  }
}

module.exports = async (req, res, next) => {
  await ensureLogDirectory();

  const timestamp = new Date();
  const dateString = timestamp.toISOString().split('T')[0];
  const logFilePath = path.join(logDirectory, `${dateString}.log`);

  // Writing basic log info into file 
  res.on('finish', async () => {
    const logEntry = {
      time: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      statusCode: res.statusCode,
      requestBody: req.body
    };

    const logLine = JSON.stringify(logEntry) + '\n';

    try {
      await fs.appendFile(logFilePath, logLine, 'utf8');
    } catch (err) {
      console.error('Failed to write log:', err.message);
    }
  });

  next();
};