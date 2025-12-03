import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

// Define Schemas (copied from server.js to ensure identical logic)
const studentSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    schoolID: Number,
    email: String,
    major: String,
    currentYear: String
});
const Student = mongoose.model('Student', studentSchema);

const courseSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    credits: { type: Number, required: true }
}, { timestamps: true });
const Course = mongoose.model('Course', courseSchema);

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

const enrollmentSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    offeringId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseOffering', required: true },
    chosenLecturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    marks: { type: Number, default: null },
    enrolledAt: { type: Date }
}, { timestamps: true });
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

const debugStudents = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URL, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('Connected to MongoDB');

        // 1. List all Course Offerings
        const offerings = await CourseOffering.find().populate('courseId');
        console.log(`\nFound ${offerings.length} offerings.`);

        if (offerings.length === 0) {
            console.log('No offerings found. Exiting.');
            process.exit(0);
        }

        // 2. For the first offering, try to fetch students using the server.js logic
        const offering = offerings[0];
        console.log(`\nChecking students for offering: ${offering.courseId?.code} (${offering._id})`);

        const enrollments = await Enrollment.find({
            $or: [
                { offeringId: offering._id },
                { offeringId: offering.courseId?._id } // Note: offering.courseId is populated here, so we need ._id
            ]
        }).populate('studentId');

        console.log(`Found ${enrollments.length} enrollments.`);

        const validEnrollments = enrollments.filter(e => e.studentId);
        console.log(`Found ${validEnrollments.length} valid enrollments (with student data).`);

        validEnrollments.forEach(e => {
            console.log(`- ${e.studentId.firstName} ${e.studentId.lastName} (${e.studentId.schoolID})`);
        });

        // 3. Check raw enrollments count
        const totalEnrollments = await Enrollment.countDocuments();
        console.log(`\nTotal Enrollments in DB: ${totalEnrollments}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugStudents();
