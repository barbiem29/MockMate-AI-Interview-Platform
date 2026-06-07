const express = require("express");
const {
  addProctorEvent,
  getMyProctorLog
} = require("../controllers/proctorController");
const { protect } = require("../middleware/authMiddleware");
const { validateProctorEvent } = require("../middleware/proctorMiddleware");

const router = express.Router();

router.post("/", protect, validateProctorEvent, addProctorEvent);
router.get("/:interviewId", protect, getMyProctorLog);

module.exports = router;