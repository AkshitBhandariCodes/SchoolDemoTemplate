const Student = require('../models/Student');
const mongoose = require('mongoose');

// Create a new student admission
const createAdmission = async (req, res) => {
  try {
    const { name, email, course, admissionYear, city, address, photo } = req.body;

    // Check if student with this email already exists
    const existingStudent = await Student.findOne({ email: email.toLowerCase() });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'A student with this email already exists',
        data: null
      });
    }

    // Create new student
    const studentData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      course: course.trim(),
      admissionYear: parseInt(admissionYear),
      city: city.trim(),
      address: address.trim()
    };

    // Add photo if provided
    if (photo) {
      studentData.photo = photo;
    }

    const student = new Student(studentData);
    const savedStudent = await student.save();

    res.status(201).json({
      success: true,
      message: 'Student admission created successfully',
      data: {
        id: savedStudent._id,
        studentId: savedStudent.studentId,
        name: savedStudent.name,
        email: savedStudent.email,
        course: savedStudent.course,
        admissionYear: savedStudent.admissionYear,
        city: savedStudent.city,
        status: savedStudent.status,
        applicationDate: savedStudent.applicationDate,
        formattedApplicationDate: savedStudent.formattedApplicationDate,
        photo: savedStudent.photo
      }
    });

  } catch (error) {
    console.error('Error creating admission:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `A student with this ${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      course,
      year,
      status,
      search,
      sortBy = 'applicationDate',
      sortOrder = 'desc'
    } = req.query;

    // Build query object
    const query = {};
    
    if (course) {
      query.course = new RegExp(course, 'i');
    }
    
    if (year) {
      query.admissionYear = parseInt(year);
    }
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { course: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') }
      ];
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort configuration
    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination and sorting
    const students = await Student
      .find(query)
      .select('-address -notes') // Exclude sensitive fields for list view but keep photo
      .sort(sortConfig)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Use lean() for better performance

    // Get total count for pagination
    const totalStudents = await Student.countDocuments(query);
    const totalPages = Math.ceil(totalStudents / parseInt(limit));

    // Format students for carousel display
    const formattedStudents = students.map((student, index) => ({
      id: student._id,
      studentId: student.studentId,
      title: `${student.name}`,
      description: `${student.course} - ${student.city} (${student.admissionYear})`,
      icon: getStudentIcon(student.course),
      photo: student.photo || null,
      name: student.name,
      course: student.course,
      city: student.city,
      admissionYear: student.admissionYear,
      email: student.email,
      status: student.status,
      applicationDate: student.applicationDate
    }));

    res.status(200).json({
      success: true,
      message: 'Students retrieved successfully',
      data: formattedStudents,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalStudents,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get student by ID
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format'
      });
    }

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student retrieved successfully',
      data: student
    });

  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update student status
const updateStudentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format'
      });
    }

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, approved, or rejected'
      });
    }

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Update status using model methods
    if (status === 'approved') {
      await student.approve(notes);
    } else if (status === 'rejected') {
      await student.reject(notes);
    } else {
      student.status = status;
      student.approvalDate = undefined;
      if (notes) student.notes = notes;
      await student.save();
    }

    res.status(200).json({
      success: true,
      message: `Student ${status} successfully`,
      data: {
        id: student._id,
        status: student.status,
        approvalDate: student.approvalDate,
        notes: student.notes
      }
    });

  } catch (error) {
    console.error('Error updating student status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get admission statistics
const getAdmissionStats = async (req, res) => {
  try {
    const stats = await Student.aggregate([
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          pendingApplications: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          approvedStudents: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejectedApplications: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      }
    ]);

    const courseStats = await Student.aggregate([
      {
        $group: {
          _id: '$course',
          count: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const yearStats = await Student.aggregate([
      {
        $group: {
          _id: '$admissionYear',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.status(200).json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: {
        overview: stats[0] || {
          totalStudents: 0,
          pendingApplications: 0,
          approvedStudents: 0,
          rejectedApplications: 0
        },
        courseStats,
        yearStats
      }
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper function to get appropriate icon based on course
const getStudentIcon = (course) => {
  const courseIcons = {
    'computer science': '💻',
    'engineering': '⚙️',
    'business': '💼',
    'medicine': '🏥',
    'arts': '🎨',
    'science': '🔬',
    'mathematics': '📊',
    'physics': '⚛️',
    'chemistry': '⚗️',
    'biology': '🧬',
    'english': '📚',
    'history': '📜',
    'psychology': '🧠',
    'economics': '💰',
    'law': '⚖️'
  };

  const courseLower = course.toLowerCase();
  for (const [key, icon] of Object.entries(courseIcons)) {
    if (courseLower.includes(key)) {
      return icon;
    }
  }
  return '🎓'; // Default graduation cap icon
};

module.exports = {
  createAdmission,
  getAllStudents,
  getStudentById,
  updateStudentStatus,
  getAdmissionStats
};