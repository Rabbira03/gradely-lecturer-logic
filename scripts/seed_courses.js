import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const uri = process.env.MONGO_URL;

if (!uri) {
    console.error('Error: MONGO_URL not found in .env file');
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
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(); // Uses the database from the connection string
        const collection = db.collection('offerings'); // Assuming 'offerings' is the collection name based on API endpoints

        // Check if courses already exist to avoid duplicates (optional, but good practice)
        // For simplicity, we'll just insert them.

        const result = await collection.insertMany(courses);
        console.log(`${result.insertedCount} courses inserted successfully.`);

    } catch (err) {
        console.error('Error seeding courses:', err);
    } finally {
        await client.close();
    }
}

run();
