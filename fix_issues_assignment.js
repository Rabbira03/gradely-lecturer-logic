import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    role: { type: String, enum: ['student', 'lecturer', 'admin'], default: 'student' }
});
const User = mongoose.model('User', userSchema);

const studentSchema = new mongoose.Schema({ firstName: String, lastName: String, schoolID: Number, email: String });
const Student = mongoose.model('Student', studentSchema);

const issueSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    lecturer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    issueType: { type: String },
    subject: { type: String },
    description: { type: String },
    status: { type: String, default: 'pending' }
}, { timestamps: true });
const Issue = mongoose.model('Issue', issueSchema);

const fixIssues = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected!');

        // 1. Find a valid Lecturer
        // Try to find a specific one first, or just the first one
        let lecturer = await User.findOne({ role: 'lecturer' });
        if (!lecturer) {
            console.error('No lecturer found! Cannot assign issues.');
            process.exit(1);
        }
        console.log(`Found Lecturer: ${lecturer.fullName} (${lecturer.email})`);

        // 2. Find a valid Student
        const student = await Student.findOne();
        if (!student) {
            console.error('No student found! Cannot assign issues.');
            process.exit(1);
        }
        console.log(`Found Student: ${student.firstName} ${student.lastName}`);

        // 3. Update all issues
        const result = await Issue.updateMany({}, {
            $set: {
                lecturer: lecturer._id,
                student: student._id
            }
        });

        console.log(`Updated ${result.modifiedCount} issues.`);
        console.log(`\nIMPORTANT: Please log in as "${lecturer.email}" to see these issues.`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

fixIssues();
