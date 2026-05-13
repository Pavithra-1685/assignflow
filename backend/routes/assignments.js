const express = require('express');
const Assignment = require('../models/Assignment');
const auth = require('../middleware/auth');
const upload = require('../services/storage');
const router = express.Router();

// Middleware to check if user is a teacher or admin
const isTeacher = (req, res, next) => {
  if (req.user.role === 'teacher' || req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Teachers only.' });
  }
};

// Create Assignment
router.post('/create', auth, isTeacher, upload.single('attachment'), async (req, res) => {
  try {
    const { title, description, subject, deadline, priority, mcqQuestions, whatsappGroupId } = req.body;
    
    const assignment = new Assignment({
      title,
      description,
      subject,
      deadline,
      priority,
      mcqQuestions: mcqQuestions ? JSON.parse(mcqQuestions) : [],
      teacherId: req.user.id,
      attachmentUrl: req.file ? req.file.path : null,
      whatsappGroupId
    });

    await assignment.save();
    
    // Trigger WhatsApp Notification
    const { sendAssignmentNotification } = require('../services/whatsapp');
    if (whatsappGroupId) {
      await sendAssignmentNotification(whatsappGroupId, assignment);
    }

    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List Assignments
router.get('/', auth, async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('teacherId', 'displayName email')
      .sort({ deadline: 1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Teacher Stats
router.get('/stats/teacher', auth, isTeacher, async (req, res) => {
  try {
    const Submission = require('../models/Submission');
    const assignments = await Assignment.find({ teacherId: req.user.id });
    const assignmentIds = assignments.map(a => a._id);
    
    const [totalSubmissions, pendingGrading, flagged] = await Promise.all([
      Submission.countDocuments({ assignmentId: { $in: assignmentIds } }),
      Submission.countDocuments({ assignmentId: { $in: assignmentIds }, marks: { $exists: false } }),
      Submission.countDocuments({ assignmentId: { $in: assignmentIds }, isFlagged: true })
    ]);

    res.json({
      totalSubmissions,
      pendingGrading,
      flagged,
      activeAssignments: assignments.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Single Assignment
router.get('/:id', auth, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('teacherId', 'displayName email');
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
