const mongoose = require('mongoose');
const app = require('./server');
const axios = require('axios');

beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/phreddit');
});

afterAll(async () => {
    await mongoose.connection.close();  // Close connection after tests
});

test('listening on port 8000', async () => {
    try {
        const response = await axios.get('http://localhost:8000');
        
        // Assert the response status is 200 (indicating the server is running)
        expect(response.status).toBe(200);
      } catch (error) {
        console.error('Error while testing server listening:', error);
        throw error;
      }
});
