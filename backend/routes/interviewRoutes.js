const express = require("express");
const {
  startInterview,
  getInterviewById,
  getNextQuestion,
  submitAnswer,
  endInterview
} = require("../controllers/interviewController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/start", protect, startInterview);
router.get("/:id", protect, getInterviewById);
router.get("/:id/next-question", protect, getNextQuestion);
router.post("/:id/question/:questionId/answer", protect, submitAnswer);
router.post("/:id/end", protect, endInterview);

module.exports = router;