import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

// --- Schemas (Simplified for reading) ---
const studentSchema = new mongoose.Schema({ firstName: String, lastName: String, schoolID: Number, email: String });
const Student = mongoose.model('Student', studentSchema);

const courseSchema = new mongoose.Schema({ code: String, name: String });
const Course = mongoose.model('Course', courseSchema);

const courseOfferingSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    assessments: [{ name: String, weight: Number, maxScore: Number }]
});
const CourseOffering = mongoose.model('CourseOffering', courseOfferingSchema);

const markSchema = new mongoose.Schema({
    assessmentId: mongoose.Schema.Types.ObjectId,
    offeringId: mongoose.Schema.Types.ObjectId,
    studentId: mongoose.Schema.Types.ObjectId,
    score: Number
});
const Mark = mongoose.model('Mark', markSchema);

const debugFullFlow = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected!\n');

        // 1. Fetch Offerings
        const offerings = await CourseOffering.find().populate('courseId');
        console.log(`--- 1. Offerings (${offerings.length}) ---`);
        if (offerings.length === 0) throw new Error('No offerings found');

        const offering = offerings[0]; // Pick the first one
        console.log(`Selected Offering: ${offering.courseId?.code} (ID: ${offering._id})`);
        console.log('Assessments:', offering.assessments.map(a => `${a.name} (${a._id})`).join(', '));

        // 2. Fetch Marks for this Offering
        const marks = await Mark.find({ offeringId: offering._id });
        console.log(`\n--- 2. Marks for Offering (${marks.length}) ---`);

        if (marks.length === 0) {
            console.log('WARNING: No marks found for this offering ID!');
            // Try finding ANY marks to see if offering IDs are different
            const anyMarks = await Mark.findOne();
            if (anyMarks) {
                console.log('Sample mark offeringId:', anyMarks.offeringId);
                console.log('Does it match?', anyMarks.offeringId.toString() === offering._id.toString());
            }
        } else {
            const sampleMark = marks[0];
            console.log('Sample Mark:', {
                studentId: sampleMark.studentId,
                assessmentId: sampleMark.assessmentId,
                score: sampleMark.score
            });

            // 3. Verify Assessment ID Match
            const assessmentMatch = offering.assessments.find(a => a._id.toString() === sampleMark.assessmentId.toString());
            console.log(`\nAssessment Match: ${assessmentMatch ? 'YES (' + assessmentMatch.name + ')' : 'NO (ID mismatch!)'}`);

            // 4. Verify Student ID Match
            const student = await Student.findById(sampleMark.studentId);
            console.log(`Student Match: ${student ? 'YES (' + student.firstName + ')' : 'NO (Student not found!)'}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugFullFlow();
