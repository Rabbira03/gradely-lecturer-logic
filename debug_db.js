import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const run = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected!');

        const db = mongoose.connection.db;

        // 1. List Collections
        const collections = await db.listCollections().toArray();
        console.log('\n--- Collections ---');
        collections.forEach(c => console.log(`- ${c.name}`));

        // 2. Count Documents
        console.log('\n--- Counts ---');
        for (const c of collections) {
            const count = await db.collection(c.name).countDocuments();
            console.log(`${c.name}: ${count}`);
        }

        // 3. Inspect Enrollments
        console.log('\n--- Enrollment Inspection ---');
        const enrollments = await db.collection('enrollments').find({}).limit(5).toArray();
        if (enrollments.length === 0) {
            console.log('No enrollments found.');
        } else {
            for (const e of enrollments) {
                console.log(`Enrollment ${e._id}:`);
                console.log(`  studentId: ${e.studentId} (Type: ${typeof e.studentId})`);

                // Check if student exists in 'users'
                let user = null;
                try {
                    user = await db.collection('users').findOne({ _id: e.studentId });
                } catch (err) { }
                console.log(`  Found in 'users'? ${!!user}`);

                // Check if student exists in 'students' (if it exists)
                if (collections.find(c => c.name === 'students')) {
                    let student = null;
                    try {
                        student = await db.collection('students').findOne({ _id: e.studentId });
                    } catch (err) { }
                    console.log(`  Found in 'students'? ${!!student}`);
                    if (student) {
                        console.log('  Student Document Sample:', JSON.stringify(student, null, 2));
                    }
                }
                console.log(`  Marks (on Enrollment): ${e.marks}`);
            }
        }

        // 4. Inspect Course Offerings (Assessments)
        console.log('\n--- Course Offering Inspection ---');
        const offerings = await db.collection('courseofferings').find({}).limit(5).toArray();
        if (offerings.length === 0) {
            console.log('No offerings found.');
        } else {
            offerings.forEach((o, i) => {
                console.log(`Offering ${i + 1} (${o._id}):`);
                console.log(`  Assessments:`, JSON.stringify(o.assessments, null, 2));
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
