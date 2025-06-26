const request = require('supertest');
const express = require('express');
const statsRouter = require('../src/routes/stats');
const fs = require('fs').promises;

jest.mock('fs', () => ({
    promises: {
        stat: jest.fn(),
        readFile: jest.fn()
    }
}));

describe('GET /api/stats', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use('/api/stats', statsRouter);
    });

    it('should return stats with total and averagePrice', async () => {
        const fakeItems = [
            { id: 1, name: 'Iphone', category: 'Eletronics', price: 1550 },
            { id: 2, name: 'Desk', category: 'Furniture', price: 150 }
        ];

        fs.stat.mockResolvedValue({ mtimeMs: Date.now() });
        fs.readFile.mockResolvedValue(JSON.stringify(fakeItems));

        const res = await request(app).get('/api/stats');

        expect(res.statusCode).toBe(200);
        expect(res.body.total).toBe(2);
        expect(res.body.averagePrice).toBe(850);
    });

    it('should return cached stats if file unchanged', async () => {
        const now = Date.now();
        const fakeItems = [
            { id: 1, name: 'Iphone', category: 'Eletronics', price: 1550 },
            { id: 2, name: 'Desk', category: 'Furniture', price: 150 }
        ];

        fs.stat.mockResolvedValue({ mtimeMs: now });
        fs.readFile.mockResolvedValue(JSON.stringify(fakeItems));

        // First call to prime cache
        await request(app).get('/api/stats');

        // Second call should use cached result
        const res2 = await request(app).get('/api/stats');
        expect(res2.statusCode).toBe(200);
        expect(res2.body.total).toBe(2);
        expect(res2.body.averagePrice).toBe(850);
    });

    it('should return 500 if file is corrupted', async () => {
        fs.stat.mockResolvedValue({ mtimeMs: Date.now() });
        fs.readFile.mockResolvedValue('this is not json');

        const res = await request(app).get('/api/stats');
        expect(res.statusCode).toBe(500);
    });
});
