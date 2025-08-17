const express = require('express');
const {
  createAdmission,
  getAllStudents,
  getStudentById,
  updateStudentStatus,
  getAdmissionStats
} = require('../controllers/admissionController');

const router = express.Router();

// @route   POST /api/admissions
// @desc    Create a new student admission
// @access  Public
router.post('/', createAdmission);

// @route   GET /api/admissions
// @desc    Get all students with optional filtering, pagination, and sorting
// @access  Public
// Query parameters:
// - page: Page number (default: 1)
// - limit: Number of items per page (default: 10)
// - course: Filter by course name (case-insensitive partial match)
// - year: Filter by admission year
// - status: Filter by status (pending, approved, rejected)
// - search: Search in name, email, course, city
// - sortBy: Sort field (default: applicationDate)
// - sortOrder: Sort order (asc, desc - default: desc)
router.get('/', getAllStudents);

// @route   GET /api/admissions/stats
// @desc    Get admission statistics
// @access  Public
router.get('/stats', getAdmissionStats);

// @route   GET /api/admissions/:id
// @desc    Get student by ID
// @access  Public
router.get('/:id', getStudentById);

// @route   PATCH /api/admissions/:id/status
// @desc    Update student admission status
// @access  Public (In production, this should be protected)
router.patch('/:id/status', updateStudentStatus);

module.exports = router;