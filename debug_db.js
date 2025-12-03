import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const debugDb = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected!');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        console.log('\n--- Collections ---');
        collections.forEach(c => console.log(`- ${c.name}`));

        const issues = await db.collection('issues').countDocuments();
        const courseofferings = await db.collection('courseofferings').countDocuments();
        const courses = await db.collection('courses').countDocuments();
        const users = await db.collection('users').countDocuments();
        const gradescales = await db.collection('gradescales').countDocuments();
        const students = await db.collection('students').countDocuments();
        const enrollments = await db.collection('enrollments').countDocuments();
        const lecturers = await db.collection('lecturers').countDocuments();
        const marks = await db.collection('marks').countDocuments();

        console.log('\n--- Counts ---');
        console.log(`issues: ${issues}`);
        console.log(`courseofferings: ${courseofferings}`);
        console.log(`courses: ${courses}`);
        console.log(`users: ${users}`);
        console.log(`gradescales: ${gradescales}`);
        console.log(`students: ${students}`);
        console.log(`enrollments: ${enrollments}`);
        console.log(`lecturers: ${lecturers}`);
        console.log(`marks: ${marks}`);

        if (gradescales > 0) {
            console.log('\n--- Grade Scales ---');
            const scales = await db.collection('gradescales').find().toArray();
            console.log(scales);
        } else {
            console.log('\n!!! NO GRADE SCALES FOUND !!!');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugDb();
