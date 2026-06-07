const express = require("express");
const {
  getMyResults,
  getResultByInterviewId
} = require("../controllers/resultController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getMyResults);
router.get("/:interviewId", protect, getResultByInterviewId);

module.exports = router;