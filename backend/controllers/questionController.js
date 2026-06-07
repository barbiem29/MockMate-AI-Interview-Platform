const asyncHandler = require("express-async-handler");
const Question = require("../models/Question");

const createQuestion = asyncHandler(async (req, res) => {
  const question = await Question.create(req.body);

  res.status(201).json({
    success: true,
    message: "Question created successfully",
    data: question
  });
});

const getQuestions = asyncHandler(async (req, res) => {
  const { category, difficulty, questionType, companyTag } = req.query;

  const filter = { isActive: true };

  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;
  if (questionType) filter.questionType = questionType;
  if (companyTag) filter.companyTag = companyTag;

  const questions = await Question.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: questions.length,
    data: questions
  });
});

const getQuestionById = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id);

  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  res.status(200).json({
    success: true,
    data: question
  });
});

module.exports = {
  createQuestion,
  getQuestions,
  getQuestionById
};