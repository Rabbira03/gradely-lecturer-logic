import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const issueSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    offeringId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseOffering', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
}, { timestamps: true });
const Issue = mongoose.model('Issue', issueSchema);

const studentSchema = new mongoose.Schema({ firstName: String, lastName: String });
const Student = mongoose.model('Student', studentSchema);

const courseOfferingSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    assignedLecturerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});
const CourseOffering = mongoose.model('CourseOffering', courseOfferingSchema);

const debugIssues = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected!\n');

        const issues = await Issue.find();
        console.log(`Found ${issues.length} issues.`);

        for (const issue of issues) {
            console.log(`\nChecking Issue: ${issue.title} (ID: ${issue._id})`);

            // Check Student
            const student = await Student.findById(issue.studentId);
            console.log(`- Student ID: ${issue.studentId}`);
            console.log(`  -> Exists? ${student ? 'YES (' + student.firstName + ')' : 'NO (Orphaned!)'}`);

            // Check Offering
            const offering = await CourseOffering.findById(issue.offeringId);
            console.log(`- Offering ID: ${issue.offeringId}`);
            console.log(`  -> Exists? ${offering ? 'YES' : 'NO (Orphaned!)'}`);

            if (offering) {
                console.log(`  -> Lecturer IDs: ${offering.assignedLecturerIds}`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugIssues();
