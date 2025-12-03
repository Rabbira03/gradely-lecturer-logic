import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

// Use a loose schema to fetch everything
const issueSchema = new mongoose.Schema({}, { strict: false });
const Issue = mongoose.model('Issue', issueSchema);

const inspectIssue = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected!\n');

        const issues = await Issue.find().lean();
        console.log(`Found ${issues.length} issues.`);

        if (issues.length > 0) {
            console.log('Raw Issue Document:');
            console.log(JSON.stringify(issues[0], null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

inspectIssue();
