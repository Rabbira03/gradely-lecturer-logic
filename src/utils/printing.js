/**
 * Printing and Export Utilities
 * Handles CSV export, HTML report generation, and printing
 * @module printing
 */

import { calculateTotal, calculateGrade, hasPassed } from './grading.js';

/**
 * Convert student marks data to CSV format
 * @param {Object[]} studentsWithMarks - Array of students with marks
 * @returns {string} CSV formatted string
 */
export const convertToCSV = (studentsWithMarks) => {
  if (!studentsWithMarks || studentsWithMarks.length === 0) {
    return '';
  }

  // CSV headers
  const headers = [
    'Student ID',
    'Student Name',
    'Email',
    'Assignment (/10)',
    'Quiz (/15)',
    'Project (/25)',
    'Midsem (/20)',
    'Final Exam (/30)',
    'Total (/100)',
    'Grade',
    'Status'
  ];

  // Convert data rows
  const rows = studentsWithMarks.map(student => {
    const marks = student.marks || {};
    const total = calculateTotal(marks);
    const grade = calculateGrade(total);
    const status = hasPassed(total) ? 'PASS' : 'FAIL';

    return [
      student.id || '',
      student.name || '',
      student.email || '',
      marks.assignment || 0,
      marks.quiz || 0,
      marks.project || 0,
      marks.midsem || 0,
      marks.finalExam || 0,
      total,
      grade,
      status
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
};

/**
 * Download CSV file
 * @param {Object[]} studentsWithMarks - Array of students with marks
 * @param {string} filename - Filename for download (default: 'student_marks.csv')
 */
export const downloadCSV = (studentsWithMarks, filename = 'student_marks.csv') => {
  const csvContent = convertToCSV(studentsWithMarks);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Generate HTML report for student marks
 * @param {Object[]} studentsWithMarks - Array of students with marks
 * @param {Object} options - Report options
 * @param {string} options.title - Report title
 * @param {string} options.lecturerName - Lecturer's name
 * @param {string} options.courseName - Course name
 * @param {Object} options.statistics - Class statistics
 * @returns {string} HTML string
 */
export const generateHTMLReport = (studentsWithMarks, options = {}) => {
  const {
    title = 'Student Marks Report',
    lecturerName = '',
    courseName = '',
    statistics = {}
  } = options;

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      color: #2c3e50;
    }
    .info {
      margin: 20px 0;
    }
    .info p {
      margin: 5px 0;
    }
    .statistics {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .statistics h3 {
      margin-top: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #2c3e50;
      color: white;
      font-weight: bold;
    }
    tr:nth-child(even) {
      background-color: #f2f2f2;
    }
    .pass {
      color: #27ae60;
      font-weight: bold;
    }
    .fail {
      color: #e74c3c;
      font-weight: bold;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #7f8c8d;
    }
    @media print {
      body {
        margin: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <p>${currentDate}</p>
  </div>

  <div class="info">
    ${lecturerName ? `<p><strong>Lecturer:</strong> ${lecturerName}</p>` : ''}
    ${courseName ? `<p><strong>Course:</strong> ${courseName}</p>` : ''}
  </div>

  ${statistics && Object.keys(statistics).length > 0 ? `
  <div class="statistics">
    <h3>Class Statistics</h3>
    <p><strong>Total Students:</strong> ${statistics.totalStudents || 0}</p>
    <p><strong>Average Score:</strong> ${statistics.average || 0}%</p>
    <p><strong>Highest Score:</strong> ${statistics.highest || 0}%</p>
    <p><strong>Lowest Score:</strong> ${statistics.lowest || 0}%</p>
    <p><strong>Pass Rate:</strong> ${statistics.passRate || 0}%</p>
    <p><strong>Passed:</strong> ${statistics.passedStudents || 0} students</p>
    <p><strong>Failed:</strong> ${statistics.failedStudents || 0} students</p>
  </div>
  ` : ''}

  <table>
    <thead>
      <tr>
        <th>Student ID</th>
        <th>Name</th>
        <th>Assignment<br>(/10)</th>
        <th>Quiz<br>(/15)</th>
        <th>Project<br>(/25)</th>
        <th>Midsem<br>(/20)</th>
        <th>Final<br>(/30)</th>
        <th>Total<br>(/100)</th>
        <th>Grade</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
  `;

  studentsWithMarks.forEach(student => {
    const marks = student.marks || {};
    const total = calculateTotal(marks);
    const grade = calculateGrade(total);
    const passed = hasPassed(total);
    const statusClass = passed ? 'pass' : 'fail';
    const statusText = passed ? 'PASS' : 'FAIL';

    html += `
      <tr>
        <td>${student.id || ''}</td>
        <td>${student.name || ''}</td>
        <td>${marks.assignment || 0}</td>
        <td>${marks.quiz || 0}</td>
        <td>${marks.project || 0}</td>
        <td>${marks.midsem || 0}</td>
        <td>${marks.finalExam || 0}</td>
        <td><strong>${total}</strong></td>
        <td><strong>${grade}</strong></td>
        <td class="${statusClass}">${statusText}</td>
      </tr>
    `;
  });

  html += `
    </tbody>
  </table>

  <div class="footer">
    <p>Generated by Online Examination System</p>
  </div>
</body>
</html>
  `;

  return html;
};

/**
 * Print HTML report
 * @param {string} htmlContent - HTML content to print
 */
export const printHTMLReport = (htmlContent) => {
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.print();
    };
  } else {
    console.error('Failed to open print window. Please check popup blocker settings.');
  }
};

/**
 * Generate and print student marks report
 * @param {Object[]} studentsWithMarks - Array of students with marks
 * @param {Object} options - Report options
 */
export const generateAndPrintReport = (studentsWithMarks, options = {}) => {
  const htmlContent = generateHTMLReport(studentsWithMarks, options);
  printHTMLReport(htmlContent);
};

/**
 * Download HTML report as file
 * @param {Object[]} studentsWithMarks - Array of students with marks
 * @param {Object} options - Report options
 * @param {string} filename - Filename for download (default: 'marks_report.html')
 */
export const downloadHTMLReport = (studentsWithMarks, options = {}, filename = 'marks_report.html') => {
  const htmlContent = generateHTMLReport(studentsWithMarks, options);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const link = document.createElement('a');
  
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Format student data for display
 * @param {Object[]} studentsWithMarks - Array of students with marks
 * @returns {Object[]} Formatted student data
 */
export const formatStudentsForDisplay = (studentsWithMarks) => {
  return studentsWithMarks.map(student => {
    const marks = student.marks || {};
    const total = calculateTotal(marks);
    const grade = calculateGrade(total);
    const passed = hasPassed(total);

    return {
      ...student,
      calculatedTotal: total,
      calculatedGrade: grade,
      status: passed ? 'PASS' : 'FAIL',
      passed,
    };
  });
};

export default {
  convertToCSV,
  downloadCSV,
  generateHTMLReport,
  printHTMLReport,
  generateAndPrintReport,
  downloadHTMLReport,
  formatStudentsForDisplay,
};
