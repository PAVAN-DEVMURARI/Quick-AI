// Simple test to verify server setup
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001; // Different port to avoid conflicts

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Test server is working!', timestamp: new Date().toISOString() });
});

app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'API routes working!', endpoint: '/api/test' });
});

app.listen(PORT, () => {
    console.log(`Test server running on http://localhost:${PORT}`);
    console.log('Try: http://localhost:3001/api/test');
});