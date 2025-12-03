import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// Middleware
app.use(cors());
app.use(express.json());

// Request Logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- Schemas ---

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true },
    role: { type: String, enum: ['student', 'lecturer', 'admin'], default: 'student' },
    staffNo: String,
    regNo: String
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    credits: { type: Number, required: true }
}, { timestamps: true });

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

const enrollmentSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }, // Changed to ref 'Student'
    offeringId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseOffering', required: true },
    chosenLecturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Made optional
    marks: { type: Number, default: null }, // Added to match data
    enrolledAt: { type: Date } // Added to match data
}, { timestamps: true });

const markSchema = new mongoose.Schema({
    assessmentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    offeringId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseOffering', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true }, // Changed to ref 'Student'
    lecturerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true, min: 0 }
}, { timestamps: true });

markSchema.index({ assessmentId: 1, studentId: 1 }, { unique: true });

const studentSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    schoolID: Number,
    email: String,
    major: String,
    currentYear: String
});

const User = mongoose.model('User', userSchema);
// Define Student model to map to 'students' collection
const Student = mongoose.model('Student', studentSchema);
const Course = mongoose.model('Course', courseSchema);
const CourseOffering = mongoose.model('CourseOffering', courseOfferingSchema);
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
const Mark = mongoose.model('Mark', markSchema);

const gradeScaleSchema = new mongoose.Schema({
    grade: { type: String, required: true },
    minScore: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    gpa: { type: Number, required: true }
});
const GradeScale = mongoose.model('GradeScale', gradeScaleSchema);

const issueSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    offeringId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseOffering', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
}, { timestamps: true });
const Issue = mongoose.model('Issue', issueSchema);

// --- Routes ---

// Register
app.post('/auth/register', async (req, res) => {
    try {
        const { email, password, fullName, staffNo, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            email,
            passwordHash: hashedPassword,
            fullName,
            staffNo,
            role: role || 'lecturer'
        });

        await user.save();
        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Login
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.fullName,
                    staffNo: user.staffNo,
                    role: user.role
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Middleware to verify token
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ success: false, message: 'Invalid token' });
        req.user = { _id: decoded.id, role: decoded.role };
        next();
    });
};

// Get Offerings
app.get('/lecturer/offerings', authenticate, async (req, res) => {
    try {
        const offerings = await CourseOffering.find({
            assignedLecturerIds: req.user._id
        })
            .populate('courseId')
            .populate('assignedLecturerIds', 'fullName staffNo');

        const formattedOfferings = offerings.map(offering => ({
            id: offering._id,
            courseCode: offering.courseId?.code,
            title: offering.courseId?.name,
            term: offering.term,
            year: offering.year,
            credits: offering.courseId?.credits,
            assessments: offering.assessments
        }));

        res.json(formattedOfferings);
    } catch (error) {
        console.error('Fetch offerings error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// Get Students for Offering
app.get('/lecturer/offerings/:id/students', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[DEBUG] Fetching students for offering: ${id}`);

        // 1. Get the Offering to find its Course ID
        const offering = await CourseOffering.findById(id);
        if (!offering) {
            console.log(`[DEBUG] Offering not found: ${id}`);
            return res.status(404).json({ success: false, message: 'Offering not found' });
        }

        const courseId = offering.courseId?._id || offering.courseId;
        console.log(`[DEBUG] Found offering. Course ID: ${courseId}`);

        // 2. Query Enrollments matching EITHER the Offering ID OR the Course ID
        // (This fixes the issue where enrollments were linked to the Course instead of the Offering)
        const enrollments = await Enrollment.find({
            $or: [
                { offeringId: id },
                { offeringId: courseId }
            ]
        })
            .populate('studentId')
            .populate('chosenLecturerId', 'fullName staffNo');

        console.log(`[DEBUG] Found ${enrollments.length} raw enrollments`);

        // Filter out orphaned enrollments (where studentId is null)
        const validEnrollments = enrollments.filter(e => e.studentId);
        console.log(`[DEBUG] Found ${validEnrollments.length} valid enrollments`);

        const formattedStudents = validEnrollments.map(enrollment => ({
            id: enrollment.studentId._id,
            name: `${enrollment.studentId.firstName} ${enrollment.studentId.lastName}`,
            regNo: enrollment.studentId.schoolID,
            email: enrollment.studentId.email
        }));

        res.json(formattedStudents);
    } catch (error) {
        console.error('Fetch students error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Submit Marks
app.post('/lecturer/marks/batch', authenticate, async (req, res) => {
    try {
        const marksData = req.body;
        const results = [];

        for (const markData of marksData) {
            const { assessmentId, studentId, score, offeringId } = markData;

            const mark = await Mark.findOneAndUpdate(
                { assessmentId, studentId },
                {
                    assessmentId,
                    offeringId,
                    studentId,
                    lecturerId: req.user._id,
                    score
                },
                { upsert: true, new: true }
            );
            results.push(mark);
        }

        res.json({ success: true, data: results });
    } catch (error) {
        console.error('Submit marks error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get Marks for Offering
app.get('/lecturer/offerings/:id/marks', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const marks = await Mark.find({ offeringId: id });

        res.json(marks.map(m => ({
            studentId: m.studentId,
            assessmentId: m.assessmentId,
            score: m.score
        })));
    } catch (error) {
        console.error('Fetch marks error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/lecturer/gradescales', authenticate, async (req, res) => {
    try {
        const scales = await GradeScale.find().sort({ minScore: -1 });
        res.json(scales);
    } catch (error) {
        console.error('Fetch gradescales error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get Issues for Lecturer
app.get('/lecturer/issues', authenticate, async (req, res) => {
    try {
        // 1. Find offerings taught by this lecturer
        const offerings = await CourseOffering.find({ assignedLecturerIds: req.user._id });
        const offeringIds = offerings.map(o => o._id);

        // 2. Find issues related to these offerings
        const issues = await Issue.find({ offeringId: { $in: offeringIds } })
            .populate('studentId', 'firstName lastName schoolID email')
            .populate({
                path: 'offeringId',
                populate: { path: 'courseId', select: 'code name' }
            })
            .sort({ createdAt: -1 });

        res.json(issues);
    } catch (error) {
        console.error('Fetch issues error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Resolve Issue
app.put('/lecturer/issues/:id/resolve', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const issue = await Issue.findByIdAndUpdate(id, { status: 'resolved' }, { new: true });
        res.json({ success: true, data: issue });
    } catch (error) {
        console.error('Resolve issue error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
