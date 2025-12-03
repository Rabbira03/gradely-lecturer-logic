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

const checkScales = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('Connected to MongoDB');

        const scales = await GradeScale.find().sort({ minScore: -1 });
        console.log(`Found ${scales.length} grade scales:`);
        scales.forEach(s => {
            console.log(`${s.grade}: ${s.minScore}-${s.maxScore}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkScales();
