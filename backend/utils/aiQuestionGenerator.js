const Question = require("../models/Question");

const difficultyOrder = ["easy", "medium", "hard"];

const getNextDifficulty = (currentDifficulty = "medium", performanceScore = 50) => {
  const index = difficultyOrder.indexOf(currentDifficulty);
  if (index === -1) return "medium";

  if (performanceScore >= 75 && index < difficultyOrder.length - 1) {
    return difficultyOrder[index + 1];
  }

  if (performanceScore < 40 && index > 0) {
    return difficultyOrder[index - 1];
  }

  return currentDifficulty;
};

const buildCompanyFilter = (companyMode = "general") => {
  if (!companyMode || companyMode === "general") return {};
  return { companyTag: companyMode };
};

const getAdaptiveQuestion = async ({
  interviewType = "mixed",
  category = null,
  difficulty = "medium",
  companyMode = "general",
  excludedQuestionIds = []
}) => {
  const filter = {
    isActive: true,
    difficulty,
    _id: { $nin: excludedQuestionIds }
  };

  if (interviewType !== "mixed") {
    if (interviewType === "resume-based") {
      filter.questionType = { $in: ["resume-based", "technical", "follow-up"] };
    } else if (interviewType === "voice-based") {
      filter.questionType = { $in: ["behavioral", "technical"] };
    } else if (interviewType === "company-specific") {
      filter.questionType = { $in: ["technical", "behavioral", "mcq"] };
    } else {
      filter.questionType = interviewType;
    }
  }

  if (category) {
    filter.category = category;
  }

  Object.assign(filter, buildCompanyFilter(companyMode));

  let question = await Question.findOne(filter);

  if (!question) {
    const fallbackFilter = {
      isActive: true,
      _id: { $nin: excludedQuestionIds }
    };

    if (category) fallbackFilter.category = category;

    question = await Question.findOne(fallbackFilter);
  }

  return question;
};

module.exports = {
  getAdaptiveQuestion,
  getNextDifficulty
};