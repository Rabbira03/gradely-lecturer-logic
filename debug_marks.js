import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const markSchema = new mongoose.Schema({
    assessmentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    offeringId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseOffering', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    lecturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true, min: 0 }
}, { timestamps: true });
const Mark = mongoose.model('Mark', markSchema);

const debugMarks = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('Connected!');

        const marks = await Mark.find().limit(10);
        console.log(`Found ${marks.length} marks (showing max 10):`);
        console.log(JSON.stringify(marks, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugMarks();
