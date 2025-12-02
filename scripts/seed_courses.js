import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const logFile = path.resolve(__dirname, '../seed_debug.log');
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

async function run() {
    try {
        log('Starting seed script...');
        await client.connect();
        log('Connected to MongoDB');

        const db = client.db();

        // Clear existing collections
        await db.collection('users').deleteMany({});
        await db.collection('courses').deleteMany({});
        await db.collection('courseofferings').deleteMany({});
        await db.collection('gradescales').deleteMany({});
        await db.collection('enrollments').deleteMany({});
        await db.collection('marks').deleteMany({});
        log('Cleared existing data');

        // 1. Grade Scales
        const gradeScales = [
            { letter: 'A', minPercent: 80, maxPercent: 100, points: 4.0 },
            { letter: 'B', minPercent: 70, maxPercent: 79, points: 3.0 },
            { letter: 'C', minPercent: 60, maxPercent: 69, points: 2.0 },
            { letter: 'D', minPercent: 50, maxPercent: 59, points: 1.0 },
            { letter: 'E', minPercent: 0, maxPercent: 49, points: 0.0 }
        ];
        await db.collection('gradescales').insertMany(gradeScales);
        log('Grade scales created');

        // 2. Users
        const passwordHash = await bcrypt.hash('password123', 10);

        const lecturer = {
            _id: new ObjectId(),
            email: 'lecturer@example.com',
            passwordHash: passwordHash,
            fullName: 'Dr. John Smith',
            role: 'lecturer',
            staffNo: 'LEC001',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const student = {
            _id: new ObjectId(),
            email: 'student@example.com',
            passwordHash: passwordHash,
            fullName: 'Jane Doe',
            role: 'student',
            regNo: 'REG001',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await db.collection('users').insertMany([lecturer, student]);
        log('Users created');

        // 3. Courses
        const courses = [
            { _id: new ObjectId(), code: 'SWE4070', name: 'Software Engineering II', credits: 3 },
            { _id: new ObjectId(), code: 'SWE4080', name: 'Software Testing', credits: 3 },
            { _id: new ObjectId(), code: 'CSC3020', name: 'Database Systems', credits: 3 },
            { _id: new ObjectId(), code: 'CSC3050', name: 'Algorithms', credits: 3 },
            { _id: new ObjectId(), code: 'SWE4090', name: 'Project Management', credits: 3 }
        ];

        await db.collection('courses').insertMany(courses);
        log('Courses created');

        // 4. Course Offerings
        const term = '2025S1';
        const year = 2025;

        const offerings = courses.map(course => ({
            _id: new ObjectId(),
            courseId: course._id,
            term,
            year,
            capacity: 50,
            assignedLecturerIds: [lecturer._id],
            assessments: [
                { _id: new ObjectId(), name: 'Assignment', weight: 20, maxScore: 20 },
                { _id: new ObjectId(), name: 'CAT', weight: 30, maxScore: 30 },
                { _id: new ObjectId(), name: 'Exam', weight: 50, maxScore: 50 }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        await db.collection('courseofferings').insertMany(offerings);
        log('Course offerings created');

        // 5. Enrollments
        const enrollments = offerings.map(offering => ({
            studentId: student._id,
            offeringId: offering._id,
            chosenLecturerId: lecturer._id,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        await db.collection('enrollments').insertMany(enrollments);
        log('Enrollments created');

    } catch (err) {
        log(`Error seeding: ${err.message}`);
        log(err.stack);
    } finally {
        await client.close();
        log('Connection closed');
    }
}

run();
