import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const gradeScaleSchema = new mongoose.Schema({
    grade: { type: String, required: true },
    minScore: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    gpa: { type: Number, required: true }
});
const GradeScale = mongoose.model('GradeScale', gradeScaleSchema);

const seedGradeScales = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to MongoDB');

        await GradeScale.deleteMany({});
        console.log('Cleared existing grade scales');

        const scales = [
            { grade: 'A', minScore: 90, maxScore: 100, gpa: 4.0 },
            { grade: 'A-', minScore: 87, maxScore: 89, gpa: 3.7 },
            { grade: 'B+', minScore: 84, maxScore: 86, gpa: 3.3 },
            { grade: 'B', minScore: 80, maxScore: 83, gpa: 3.0 },
            { grade: 'B-', minScore: 77, maxScore: 79, gpa: 2.7 },
            { grade: 'C+', minScore: 74, maxScore: 76, gpa: 2.3 },
            { grade: 'C', minScore: 70, maxScore: 73, gpa: 2.0 },
            { grade: 'C-', minScore: 67, maxScore: 69, gpa: 1.7 },
            { grade: 'D+', minScore: 64, maxScore: 66, gpa: 1.3 },
            { grade: 'D', minScore: 62, maxScore: 63, gpa: 1.0 },
            { grade: 'D-', minScore: 60, maxScore: 61, gpa: 0.7 },
            { grade: 'F', minScore: 0, maxScore: 59, gpa: 0.0 }
        ];

        await GradeScale.insertMany(scales);
        console.log('Inserted grade scales');

        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seedGradeScales();
