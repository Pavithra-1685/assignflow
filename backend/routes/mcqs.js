const express = require('express');
const router = express.Router();
const MCQ = require('../models/MCQ');
const auth = require('../middleware/auth');

// Get random MCQs for practice
router.get('/practice', auth, async (req, res) => {
  try {
    const mcqs = await MCQ.aggregate([{ $sample: { size: 5 } }]);
    res.json(mcqs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed some questions (for development)
router.post('/seed', async (req, res) => {
  try {
    const sampleQuestions = [
      {
        question: "Which data structure uses the LIFO principle?",
        options: ["Queue", "Stack", "Linked List", "Tree"],
        correctAnswer: 1,
        subject: "Computer Science"
      },
      {
        question: "What is the time complexity of binary search?",
        options: ["O(n)", "O(n^2)", "O(log n)", "O(1)"],
        correctAnswer: 2,
        subject: "Algorithms"
      },
      {
        question: "Which of the following is NOT a programming language?",
        options: ["Python", "HTML", "Java", "C++"],
        correctAnswer: 1,
        subject: "General Tech"
      }
    ];
    await MCQ.insertMany(sampleQuestions);
    res.json({ message: "Seed successful!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
