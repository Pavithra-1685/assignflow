const express = require('express');
const Submission = require('../models/Submission');
const auth = require('../middleware/auth');
const upload = require('../services/storage');
const { extractText, checkDuplicate, storeEmbedding } = require('../services/duplicateDetection');
const router = express.Router();

// Submit Assignment
router.post('/submit/:assignmentId', auth, upload.single('submission'), async (req, res) => {
  try {
    const { assignmentId } = req.params;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // 1. Create initial submission record
    const submission = new Submission({
      assignmentId,
      studentId: req.user.id,
      fileUrl: req.file.path,
      fileName: req.file.originalname,
      status: 'submitted'
    });

    // 2. OCR / Text Extraction
    const text = await extractText(req.file.location, req.file.mimetype);
    submission.textExtracted = text;

    // 3. Duplicate Detection
    const similarityScore = await checkDuplicate(assignmentId, text);
    submission.duplicateScore = similarityScore;

    if (similarityScore > 0.85) { // 85% threshold
      submission.status = 'flagged';
      submission.isFlagged = true;
    }

    await submission.save();

    // 4. Store in Vector DB for future checks
    await storeEmbedding(submission._id, assignmentId, text);

    res.status(201).json(submission);
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ error: err.message });
  }
});

// List Submissions for an Assignment (Teacher only)
router.get('/assignment/:assignmentId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
    const submissions = await Submission.find({ assignmentId: req.params.assignmentId })
      .populate('studentId', 'displayName email')
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
