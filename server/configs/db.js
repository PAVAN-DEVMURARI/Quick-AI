import {neon} from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverDirectory = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
dotenv.config({ path: path.join(serverDirectory, '.env') });

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set!');
    throw new Error('DATABASE_URL environment variable is required');
}

const sql = neon(process.env.DATABASE_URL);

export default sql; 