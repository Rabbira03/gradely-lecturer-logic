# Lecturer Module Logic Layer

**Group 2 - SWE 4070 Group Project 2**

This is the complete Logic Layer for the Lecturer Module of the Online Examination System.

## 📁 Project Structure

```
src/
├── services/
│   └── lecturerApi.js           # API service layer (all backend calls)
├── utils/
│   ├── validation.js            # Input and marks validation
│   ├── grading.js               # Grade calculation and statistics
│   └── printing.js              # CSV/HTML export and printing
├── hooks/
│   └── useLecturer.js           # React hooks for lecturer operations
└── examples/
    └── usageExamples.js         # Integration examples for Group 4
```

## 🎯 Features Implemented

### 1. **Lecturer Registration & Authentication**
- Register lecturers with validation
- Login/logout functionality
- Token management in localStorage
- Token validation and refresh

### 2. **Student Management**
- Fetch all students under a lecturer
- Fetch individual student details

### 3. **Marks Entry & Management**
- Enter marks for individual students
- Update existing marks
- Bulk entry (apply same marks to multiple students)
- Automatic total and grade calculation

### 4. **Grading System**
- **Marking Breakdown:**
  - Assignment: /10
  - Quiz: /15
  - Project: /25
  - Midsem: /20
  - Final Exam: /30
  - **Total: /100**

- **Grading Scale:**
  - A: 90–100
  - A−: 87–89
  - B+: 84–86
  - B: 80–83
  - B−: 77–79
  - C+: 74–76
  - C: 70–73
  - C−: 67–69
  - D+: 64–66
  - D: 62–63
  - D−: 60–61
  - F: 0–59

### 5. **Statistics & Reporting**
- Class average, highest, lowest scores
- Pass rate calculation
- Grade distribution
- CSV export
- HTML report generation
- Print functionality

### 6. **Validation**
- Email, phone, password validation
- Marks range validation
- Form input sanitization
- Comprehensive error messages

## 🚀 Quick Start for Group 4 (Frontend Developers)

### Setup
1. Install dependencies (already included in package.json)
2. Set API base URL in `.env`:
   ```
   REACT_APP_API_BASE_URL=https://your-backend-api.com
   ```

### Basic Usage

#### Authentication
```javascript
import { useAuth } from './hooks/useLecturer.js';

const MyComponent = () => {
  const { login, logout, isAuthenticated, lecturer, loading, error } = useAuth();

  const handleLogin = async () => {
    const success = await login('lecturer@email.com', 'password');
    if (success) {
      // Login successful
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome {lecturer?.name}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
};
```

#### Fetching Students
```javascript
import { useStudents } from './hooks/useLecturer.js';

const StudentList = ({ lecturerId }) => {
  const { students, loading, error, fetchStudents } = useStudents(lecturerId);

  return (
    <div>
      {students.map(student => (
        <div key={student.id}>{student.name}</div>
      ))}
    </div>
  );
};
```

#### Entering Marks
```javascript
import { useMarks } from './hooks/useLecturer.js';

const MarksForm = () => {
  const { enterMarks, loading, error } = useMarks();

  const handleSubmit = async () => {
    const result = await enterMarks({
      studentId: 'student-123',
      assignment: 8,
      quiz: 13,
      project: 20,
      midsem: 17,
      finalExam: 25
    });

    if (result.success) {
      console.log('Total:', result.total);    // 83
      console.log('Grade:', result.grade);    // B
      console.log('Passed:', result.passed);  // true
    }
  };

  return <button onClick={handleSubmit}>Submit Marks</button>;
};
```

#### Viewing Statistics
```javascript
import { useClassStatistics } from './hooks/useLecturer.js';

const Statistics = ({ lecturerId }) => {
  const { statistics, studentsWithMarks, loading, error } = useClassStatistics(lecturerId);

  return (
    <div>
      <p>Average: {statistics?.average}%</p>
      <p>Pass Rate: {statistics?.passRate}%</p>
      <p>Highest: {statistics?.highest}%</p>
      <p>Lowest: {statistics?.lowest}%</p>
    </div>
  );
};
```

#### Exporting Data
```javascript
import { downloadCSV, generateAndPrintReport } from './utils/printing.js';

const ExportButtons = ({ studentsWithMarks, statistics }) => {
  const handleCSVExport = () => {
    downloadCSV(studentsWithMarks, 'marks_export.csv');
  };

  const handlePrintReport = () => {
    generateAndPrintReport(studentsWithMarks, {
      title: 'Student Marks Report',
      lecturerName: 'Dr. John Doe',
      courseName: 'Software Engineering',
      statistics: statistics
    });
  };

  return (
    <div>
      <button onClick={handleCSVExport}>Export CSV</button>
      <button onClick={handlePrintReport}>Print Report</button>
    </div>
  );
};
```

## 📚 Complete API Reference

### Hooks

#### `useAuth()`
Returns:
- `isAuthenticated` (boolean)
- `lecturer` (object | null)
- `loading` (boolean)
- `error` (string | null)
- `login(email, password)` (async function)
- `logout()` (async function)
- `register(lecturerData)` (async function)

#### `useStudents(lecturerId)`
Returns:
- `students` (array)
- `loading` (boolean)
- `error` (string | null)
- `fetchStudents()` (async function)
- `fetchStudent(studentId)` (async function)

#### `useMarks()`
Returns:
- `loading` (boolean)
- `error` (string | null)
- `enterMarks(marksData)` (async function)
- `updateMarks(marksId, marksData)` (async function)
- `bulkEnter(studentIds, assessmentType, marks)` (async function)
- `fetchMarks(studentId)` (async function)

#### `useClassStatistics(lecturerId)`
Returns:
- `statistics` (object | null)
- `studentsWithMarks` (array)
- `loading` (boolean)
- `error` (string | null)
- `fetchStatistics()` (async function)

### Utility Functions

#### Validation (`validation.js`)
- `validateLecturerData(lecturerData)` - Validate registration data
- `validateStudentMarks(marksData)` - Validate complete marks
- `validateAssessmentMarks(type, marks)` - Validate single assessment
- `validateBulkMarksEntry(studentIds, type, marks)` - Validate bulk entry
- `isValidEmail(email)` - Email validation
- `isValidPhone(phone)` - Phone validation
- `isValidPassword(password)` - Password validation

#### Grading (`grading.js`)
- `calculateTotal(marks)` - Calculate total marks
- `calculateGrade(total)` - Determine letter grade
- `hasPassed(total)` - Check if student passed
- `calculateGradingResult(marks)` - Complete grading calculation
- `calculateClassStatistics(studentsMarks)` - Class statistics
- `getGradeDistribution(studentsMarks)` - Grade distribution

#### Printing (`printing.js`)
- `downloadCSV(studentsWithMarks, filename)` - Export to CSV
- `generateHTMLReport(studentsWithMarks, options)` - Generate HTML report
- `generateAndPrintReport(studentsWithMarks, options)` - Print report
- `downloadHTMLReport(studentsWithMarks, options, filename)` - Save HTML file

## 🔄 Integration with Other Groups

### For Group 4 (Frontend Developers)
1. Import hooks from `src/hooks/useLecturer.js`
2. Import utilities from `src/utils/` as needed
3. Use the hooks in your UI components
4. See `src/examples/usageExamples.js` for complete examples

### For Group 5 (Backend Developers)
The logic layer expects these API endpoints:

**Authentication:**
- `POST /lecturers/register` - Register lecturer
- `POST /lecturers/register/bulk` - Bulk registration
- `POST /lecturers/login` - Login
- `POST /lecturers/logout` - Logout
- `POST /lecturers/validate-token` - Validate token
- `POST /lecturers/refresh-token` - Refresh token

**Students:**
- `GET /lecturers/:lecturerId/students` - Get all students
- `GET /students/:studentId` - Get student details
- `GET /students/:studentId/marks` - Get student marks

**Marks:**
- `POST /marks/enter` - Enter marks
- `PUT /marks/:marksId` - Update marks
- `POST /marks/bulk-enter` - Bulk marks entry
- `GET /lecturers/:lecturerId/students-with-marks` - Students with marks
- `GET /lecturers/:lecturerId/statistics` - Class statistics

## ✅ Testing Checklist

- [ ] Lecturer registration with validation
- [ ] Login/logout functionality
- [ ] Token persistence across page refreshes
- [ ] Fetch students list
- [ ] Fetch individual student details
- [ ] Enter marks with validation
- [ ] Update existing marks
- [ ] Bulk marks entry
- [ ] Calculate totals and grades correctly
- [ ] Generate class statistics
- [ ] Export to CSV
- [ ] Print HTML report
- [ ] Error handling for all operations

## 📝 Notes

- **All code is in JavaScript with JSDoc comments**
- **No TypeScript used**
- **No UI components included** (Group 4's responsibility)
- **No backend implementation** (Group 5's responsibility)
- **Fully modular and reusable**
- **Production-ready with comprehensive error handling**

## 🎓 For Group 2 Members

This logic layer is complete and ready for integration. Key points:

1. **All functionality is implemented** according to project requirements
2. **Validation is comprehensive** for all inputs
3. **Grading calculation is accurate** based on the specified scale
4. **API calls are properly structured** for Group 5 to implement
5. **Examples are provided** for Group 4 to integrate
6. **Error handling is robust** throughout

## 📞 Support

For questions about the logic layer:
- Check `src/examples/usageExamples.js` for implementation patterns
- Review JSDoc comments in each file for detailed documentation
- Test with mock data before backend integration

---

**Created by Group 2 - Lecturer Module Team**
