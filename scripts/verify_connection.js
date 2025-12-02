import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const outputFile = path.resolve(__dirname, '../verify_result.txt');

async function verify() {
    try {
        console.log('Connecting to:', process.env.MONGO_URL);
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected!');
        fs.writeFileSync(outputFile, 'SUCCESS: Connected to MongoDB');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        fs.writeFileSync(outputFile, `FAILED: ${error.message}`);
        process.exit(1);
    }
}

verify();
