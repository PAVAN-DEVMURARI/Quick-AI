import {neon} from '@neondatabase/serverless';
import 'dotenv/config';

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'Not found');
console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('DATABASE')));

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set!');
    console.log('Current working directory:', process.cwd());
    console.log('Available env vars:', Object.keys(process.env).slice(0, 10));
    throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(process.env.DATABASE_URL);

export default sql; 