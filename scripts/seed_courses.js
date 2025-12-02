import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const logFile = path.resolve(__dirname, '../seed_debug.log');

// Clear previous log
fs.writeFileSync(logFile, '');

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}: ${message}\n`;
    console.log(message);
    fs.appendFileSync(logFile, logMessage);
}

const uri = process.env.MONGO_URL;

if (!uri) {
    log('Error: MONGO_URL not found in .env file');
    process.exit(1);
}

const client = new MongoClient(uri);

const courses = [
    {
        courseCode: 'SWE4070',
        title: 'Software Engineering II',
        term: 'Semester 1',
        year: '2025',
        description: 'Advanced software engineering concepts.',
        credits: 3,
        department: 'Software Engineering'
    },
    {
        courseCode: 'SWE4080',
        title: 'Software Testing',
        term: 'Semester 1',
        year: '2025',
        description: 'Principles and practices of software testing.',
        credits: 3,
        department: 'Software Engineering'
    },
    {
        courseCode: 'CSC3020',
        title: 'Database Systems',
        term: 'Semester 1',
        year: '2025',
        description: 'Design and implementation of database systems.',
        credits: 3,
        department: 'Computer Science'
    },
    {
        courseCode: 'CSC3050',
        title: 'Algorithms',
        term: 'Semester 1',
        year: '2025',
        description: 'Analysis and design of algorithms.',
        credits: 3,
        department: 'Computer Science'
    },
    {
        courseCode: 'SWE4090',
        title: 'Project Management',
        term: 'Semester 1',
        year: '2025',
        description: 'Software project management techniques.',
        credits: 3,
        department: 'Software Engineering'
    }
];

async function run() {
    try {
        log('Starting seed script...');
        // Log masked URI for debugging
        const maskedUri = uri.replace(/:([^:@]+)@/, ':****@');
        log(`Connecting to MongoDB at ${maskedUri}...`);

        await client.connect();
        log('Connected to MongoDB');

        const db = client.db();
        const collection = db.collection('offerings');

        log('Inserting courses...');
        const result = await collection.insertMany(courses);
        log(`${result.insertedCount} courses inserted successfully.`);

    } catch (err) {
        log(`Error seeding courses: ${err.message}`);
        log(err.stack);
    } finally {
        await client.close();
        log('Connection closed.');
    }
}

run();
