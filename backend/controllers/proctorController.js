const asyncHandler = require("express-async-handler");
const ProctorLog = require("../models/Proctorlog");
const Interview = require("../models/Interview");

// 🧠 SMART SCORING FUNCTION
const calculateSuspicion = (events = []) => {
  let score = 0;

  for (const event of events) {
    // Base severity scoring
    if (event.severity === "low") score += 5;
    else if (event.severity === "medium") score += 10;
    else if (event.severity === "high") score += 25;

    // 🔥 Special high-risk events (extra boost)
    if (event.eventType === "multiple-faces") score += 40;
    if (event.eventType === "copy-paste") score += 30;
  }

  return Math.min(100, score); // cap at 100
};

// 🎯 STATUS DECISION
const getStatusFromScore = (score) => {
  if (score >= 50) return "flagged";
  if (score >= 20) return "warning";
  return "clean";
};

// 🚀 ADD PROCTOR EVENT
const addProctorEvent = asyncHandler(async (req, res) => {
  const {
    interviewId,
    eventType,
    description = "",
    severity = "medium"
  } = req.body;

  if (!interviewId) {
    res.status(400);
    throw new Error("interviewId is required");
  }

  // check interview belongs to user
  const interview = await Interview.findOne({
    _id: interviewId,
    user: req.user._id
  });

  if (!interview) {
    res.status(404);
    throw new Error("Interview not found");
  }

  // find or create log
  let log = await ProctorLog.findOne({
    interview: interviewId,
    user: req.user._id
  });

  if (!log) {
    log = await ProctorLog.create({
      user: req.user._id,
      interview: interviewId,
      events: [],
      totalWarnings: 0,
      highSeverityCount: 0,
      cheatingSuspicionScore: 0,
      status: "clean"
    });
  }

  // ➕ ADD EVENT
  log.events.push({
    eventType,
    description,
    severity,
    timestamp: new Date()
  });

  // 🔢 UPDATE COUNTS
  log.totalWarnings = log.events.length;
  log.highSeverityCount = log.events.filter(
    (e) => e.severity === "high"
  ).length;

  // 🧠 CALCULATE SCORE
  log.cheatingSuspicionScore = calculateSuspicion(log.events);

  // 🎯 UPDATE STATUS
  log.status = getStatusFromScore(log.cheatingSuspicionScore);

  await log.save();

  res.status(201).json({
    success: true,
    message: "Proctoring event logged successfully",
    data: log
  });
});

// 📊 GET LOG
const getMyProctorLog = asyncHandler(async (req, res) => {
  const log = await ProctorLog.findOne({
    interview: req.params.interviewId,
    user: req.user._id
  }).populate("interview");

  if (!log) {
    res.status(404);
    throw new Error("Proctor log not found");
  }

  res.status(200).json({
    success: true,
    data: log
  });
});

module.exports = {
  addProctorEvent,
  getMyProctorLog
};