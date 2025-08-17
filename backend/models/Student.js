const mongoose = require('mongoose');
const validator = require('validator');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email address']
  },
  course: {
    type: String,
    required: [true, 'Course is required'],
    trim: true,
    minlength: [2, 'Course must be at least 2 characters long'],
    maxlength: [100, 'Course cannot exceed 100 characters']
  },
  admissionYear: {
    type: Number,
    required: [true, 'Admission year is required'],
    min: [2020, 'Admission year must be 2020 or later'],
    max: [2030, 'Admission year must be 2030 or earlier'],
    validate: {
      validator: function(value) {
        return Number.isInteger(value);
      },
      message: 'Admission year must be a valid integer'
    }
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    minlength: [2, 'City must be at least 2 characters long'],
    maxlength: [50, 'City cannot exceed 50 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
    minlength: [10, 'Address must be at least 10 characters long'],
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  photo: {
    type: String, // Base64 encoded image data
    validate: {
      validator: function(value) {
        if (!value) return true; // Photo is optional
        // Basic validation for base64 image data
        return /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(value);
      },
      message: 'Invalid photo format. Please upload a valid image.'
    }
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple documents with null/undefined studentId
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  approvalDate: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes for better query performance
studentSchema.index({ email: 1 });
studentSchema.index({ admissionYear: 1 });
studentSchema.index({ course: 1 });
studentSchema.index({ status: 1 });
studentSchema.index({ applicationDate: -1 });

// Virtual field for formatted application date
studentSchema.virtual('formattedApplicationDate').get(function() {
  return this.applicationDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual field for student display name with course
studentSchema.virtual('displayInfo').get(function() {
  return `${this.name} - ${this.course} (${this.admissionYear})`;
});

// Pre-save middleware to generate student ID
studentSchema.pre('save', async function(next) {
  if (this.isNew && !this.studentId) {
    // Generate student ID: YEAR + 4-digit sequential number
    const year = this.admissionYear || new Date().getFullYear();
    const count = await mongoose.model('Student').countDocuments({
      admissionYear: year
    });
    this.studentId = `${year}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Static method to get students by course
studentSchema.statics.findByCourse = function(course) {
  return this.find({ course: new RegExp(course, 'i') });
};

// Static method to get students by year
studentSchema.statics.findByYear = function(year) {
  return this.find({ admissionYear: year });
};

// Instance method to approve student
studentSchema.methods.approve = function(notes = '') {
  this.status = 'approved';
  this.approvalDate = new Date();
  if (notes) this.notes = notes;
  return this.save();
};

// Instance method to reject student
studentSchema.methods.reject = function(notes = '') {
  this.status = 'rejected';
  if (notes) this.notes = notes;
  return this.save();
};

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;