const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Interview = require("../models/Interview");
const Result = require("../models/Result");
const ProctorLog = require("../models/Proctorlog");

const getAdminDashboard = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalInterviews = await Interview.countDocuments();
  const totalResults = await Result.countDocuments();
  const totalFlaggedLogs = await ProctorLog.countDocuments({ status: "flagged" });

  const recentUsers = await User.find()
    .select("fullName email role createdAt")
    .sort({ createdAt: -1 })
    .limit(5);

  const recentResults = await Result.find()
    .populate("user", "fullName email")
    .populate("interview", "interviewType companyMode")
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalInterviews,
      totalResults,
      totalFlaggedLogs,
      recentUsers,
      recentResults
    }
  });
});

module.exports = {
  getAdminDashboard
};