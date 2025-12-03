import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const studentSchema = new mongoose.Schema({ firstName: String, lastName: String, schoolID: Number, email: String });
const Student = mongoose.model('Student', studentSchema);

const markSchema = new mongoose.Schema({
    assessmentId: mongoose.Schema.Types.ObjectId,
    offeringId: mongoose.Schema.Types.ObjectId,
    studentId: mongoose.Schema.Types.ObjectId,
    score: Number
});
const Mark = mongoose.model('Mark', markSchema);

const fixMarks = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected!');

        // 1. Find the valid student
        const student = await Student.findOne();
        if (!student) {
            console.error('No students found in the database! Cannot fix marks.');
            process.exit(1);
        }
        console.log(`Found valid student: ${student.firstName} ${student.lastName} (ID: ${student._id})`);

        // 2. Update all marks to point to this student
        const result = await Mark.updateMany({}, { $set: { studentId: student._id } });
        console.log(`Updated ${result.modifiedCount} marks to belong to this student.`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixMarks();
