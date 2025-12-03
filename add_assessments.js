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

        const courseOfferingSchema = new mongoose.Schema({
            courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
            term: { type: String, required: true },
            year: { type: Number, required: true },
            capacity: { type: Number, default: 50 },
            assignedLecturerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
            assessments: [{
                name: String,
                weight: Number,
                maxScore: Number
            }]
        }, { timestamps: true });

        const CourseOffering = mongoose.model('CourseOffering', courseOfferingSchema);

        const offerings = await CourseOffering.find({});
        console.log(`Found ${offerings.length} offerings.`);

        for (const offering of offerings) {
            console.log(`Updating assessments for offering ${offering._id}...`);

            // Overwrite assessments with the correct structure
            offering.assessments = [
                { name: 'Assignment', weight: 10, maxScore: 10 },
                { name: 'Quiz', weight: 15, maxScore: 15 },
                { name: 'Project', weight: 25, maxScore: 25 },
                { name: 'Midsem', weight: 20, maxScore: 20 },
                { name: 'Final', weight: 30, maxScore: 30 }
            ];

            await offering.save();
            console.log('  Saved.');
        }

        console.log('Done!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

run();
