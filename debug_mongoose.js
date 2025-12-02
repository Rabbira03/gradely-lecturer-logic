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

        // Define Schemas exactly as in server.js
        const studentSchema = new mongoose.Schema({
            firstName: String,
            lastName: String,
            schoolID: Number,
            email: String,
            major: String,
            currentYear: String
        });

        const enrollmentSchema = new mongoose.Schema({
            studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
            offeringId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseOffering', required: true },
            chosenLecturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            marks: { type: Number, default: null },
            enrolledAt: { type: Date }
        }, { timestamps: true });

        // Register Models
        // IMPORTANT: Mongoose pluralizes 'Student' to 'students' by default.
        const Student = mongoose.model('Student', studentSchema);
        const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

        // Fetch Enrollments
        console.log('Fetching enrollments...');
        const enrollments = await Enrollment.find({}).limit(5).populate('studentId');

        console.log(`Found ${enrollments.length} enrollments.`);

        if (enrollments.length > 0) {
            enrollments.forEach((e, i) => {
                console.log(`\nEnrollment ${i + 1}:`);
                console.log(`  ID: ${e._id}`);
                console.log(`  Offering ID: ${e.offeringId}`);
                console.log(`  Student ID (Raw): ${e.studentId?._id || e.studentId}`);
                console.log(`  Student Populated? ${e.studentId && e.studentId.firstName ? 'YES' : 'NO'}`);
                if (e.studentId && e.studentId.firstName) {
                    console.log(`  Student Name: ${e.studentId.firstName} ${e.studentId.lastName}`);
                } else {
                    console.log('  Student Data is NULL or missing fields.');
                }
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
