const express = require('express');
const app = express();

app.get('/api/token', (req, res) => {
    res.json({ token: 'mocked_token_123' });
});

const port = 4000;
app.listen(port, () => {
    console.log(`Mock token server running at http://localhost:${port}/api/token`);
});
