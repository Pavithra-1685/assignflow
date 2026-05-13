const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const auth = require('../middleware/auth');
const upload = require('../services/storage');

// Submit Assignment (Student)
router.post('/submit/:assignmentId', auth, upload.single('submission'), async (req, res) => {
  try {
    const submission = new Submission({
      assignmentId: req.params.assignmentId,
      studentId: req.user.id,
      fileUrl: req.file ? req.file.path : null,
      fileName: req.file ? req.file.originalname : 'untitled'
    });

    // Mock AI Duplicate Detection
    submission.duplicateScore = Math.random(); 
    if (submission.duplicateScore > 0.7) {
      submission.status = 'flagged';
      submission.isFlagged = true;
    }

    await submission.save();
    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Submissions for Assignment (Teacher)
router.get('/assignment/:id', auth, async (req, res) => {
  try {
    const submissions = await Submission.find({ assignmentId: req.params.id })
      .populate('studentId', 'displayName email');
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Grade Submission (Teacher)
router.patch('/grade/:id', auth, async (req, res) => {
  try {
    const { marks, feedback } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      { marks, feedback, status: 'graded' },
      { new: true }
    );
    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
