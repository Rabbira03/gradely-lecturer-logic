import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const gradeScaleSchema = new mongoose.Schema({
    letter: { type: String, required: true },
    minPercent: { type: Number, required: true },
    maxPercent: { type: Number, required: true },
    points: { type: Number, required: true }
});
const GradeScale = mongoose.model('GradeScale', gradeScaleSchema);

const seedGradeScales = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to MongoDB');

        const scales = [
            { letter: 'A', minPercent: 90, maxPercent: 100, points: 4.0 },
            { letter: 'A-', minPercent: 87, maxPercent: 89, points: 3.7 },
            { letter: 'B+', minPercent: 84, maxPercent: 86, points: 3.3 },
            { letter: 'B', minPercent: 80, maxPercent: 83, points: 3.0 },
            { letter: 'B-', minPercent: 77, maxPercent: 79, points: 2.7 },
            { letter: 'C+', minPercent: 74, maxPercent: 76, points: 2.3 },
            { letter: 'C', minPercent: 70, maxPercent: 73, points: 2.0 },
            { letter: 'C-', minPercent: 67, maxPercent: 69, points: 1.7 },
            { letter: 'D+', minPercent: 64, maxPercent: 66, points: 1.3 },
            { letter: 'D', minPercent: 62, maxPercent: 63, points: 1.0 },
            { letter: 'D-', minPercent: 60, maxPercent: 61, points: 0.7 },
            { letter: 'F', minPercent: 0, maxPercent: 59, points: 0.0 }
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
