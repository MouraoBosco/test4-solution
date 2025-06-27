const request = require('supertest');
const express = require('express');
const itemsRouter = require('../src/routes/items');

jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn().mockResolvedValue(JSON.stringify([
            { id: 1, name: 'Test Item', category: 'Tech', price: 99 },
            {
                id: 2,
                name: "Ergonomic Chair",
                category: "Furniture",
                price: 799
            },
            {
                id: 3,
                name: "Standing Desk",
                category: "Furniture",
                price: 1199
            }
        ])),
        writeFile: jest.fn().mockResolvedValue(),
    }
}));

const app = express();
app.use(express.json());
app.use('/api/items', itemsRouter);

describe('GET /api/items', () => {
    it('should return a list of items', async () => {
        const response = await request(app).get('/api/items');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('should filter items by query', async () => {
        const response = await request(app).get('/api/items?q=desk');
        expect(response.status).toBe(200);
        expect(response.body.items.some(item => item.name.toLowerCase().includes('desk'))).toBe(true);
    });

    it('should limit the number of returned items', async () => {
        const response = await request(app).get('/api/items?limit=2');
        expect(response.status).toBe(200);
        expect(response.body.items.length).toBeLessThanOrEqual(2);
    });

    it('should return 404 if item not found', async () => {
        const response = await request(app).get('/api/items/999999');
        expect(response.status).toBe(404);
    });
});

describe('POST /api/items', () => {
    it('should create a new item with valid payload', async () => {
        const newItem = { name: 'Test Item', category: 'Test Category', price: 100 };

        const response = await request(app)
            .post('/api/items')
            .send(newItem);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe('Test Item');
        expect(response.body.category).toBe('Test Category');
        expect(response.body.price).toBe(100);
    });

    it('should return 400 if payload is missing category', async () => {
        const invalidItem = { name: 'Test Item', price: 100 };

        const response = await request(app)
            .post('/api/items')
            .send(invalidItem);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid payload' });
    });

    it('should return 400 if payload is missing the price', async () => {
        const invalidItem = { name: 'Test Item', category: 'Test Category' };

        const response = await request(app)
            .post('/api/items')
            .send(invalidItem);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid payload' });
    });

    it('should return 400 if payload is invalid (wrong types)', async () => {
        const invalidItem = { name: 123, category: {}, price: 'abc' };

        const response = await request(app)
            .post('/api/items')
            .send(invalidItem);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Invalid payload' });
    });
});
