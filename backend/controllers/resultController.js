const asyncHandler = require("express-async-handler");
const Result = require("../models/Result");

const getMyResults = asyncHandler(async (req, res) => {
  const results = await Result.find({ user: req.user._id })
    .populate("interview")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: results.length,
    data: results
  });
});

const getResultByInterviewId = asyncHandler(async (req, res) => {
  const result = await Result.findOne({
    interview: req.params.interviewId,
    user: req.user._id
  }).populate("interview");

  if (!result) {
    res.status(404);
    throw new Error("Result not found");
  }

  res.status(200).json({
    success: true,
    data: result
  });
});

module.exports = {
  getMyResults,
  getResultByInterviewId
};