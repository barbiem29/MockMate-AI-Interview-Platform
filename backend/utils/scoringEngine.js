const buildFinalRating = (score) => {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 55) return "Average";
  if (score >= 40) return "Needs Improvement";
  return "Poor";
};

const buildHireRecommendation = (score) => {
  if (score >= 75) return "Hire";
  if (score >= 50) return "Borderline";
  return "No Hire";
};

const generateInterviewSummary = ({
  overallScore,
  confidenceScore,
  strengths = [],
  weaknesses = [],
  suggestions = []
}) => {
  return `
Overall score: ${overallScore}/100.
Confidence score: ${confidenceScore}/100.
Key strengths: ${strengths.length ? strengths.join(", ") : "None identified"}.
Key weaknesses: ${weaknesses.length ? weaknesses.join(", ") : "None identified"}.
Suggested improvements: ${suggestions.length ? suggestions.join(", ") : "Keep practising consistently"}.
  `.trim();
};

const calculateResultFromInterview = (interview) => {
  const answers = interview.answers || [];
  const totalQuestions = answers.length;

  if (totalQuestions === 0) {
    return {
      overallScore: 0,
      accuracy: 0,
      confidenceScore: 0,
      communicationScore: 0,
      timeManagementScore: 0,
      averageTimePerQuestion: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      unansweredQuestions: 0,
      strengths: [],
      weaknesses: ["No answers attempted"],
      improvementSuggestions: ["Attempt more questions to generate analytics"],
      finalRating: "Poor",
      hireRecommendation: "No Hire"
    };
  }

  let totalScore = 0;
  let totalConfidence = 0;
  let totalCommunication = 0;
  let totalTime = 0;
  let correctAnswers = 0;
  let unanswered = 0;

  const strengths = [];
  const weaknesses = [];
  const suggestions = [];

  for (const ans of answers) {
    totalScore += ans.finalScore || 0;
    totalConfidence += ans.confidenceScore || 0;
    totalCommunication += ans.communicationScore || 0;
    totalTime += ans.timeTakenInSeconds || 0;

    if (ans.isCorrect) correctAnswers++;
    if (!ans.userAnswerText && !ans.selectedOption) unanswered++;

    strengths.push(...(ans.strengths || []));
    weaknesses.push(...(ans.weaknesses || []));
    suggestions.push(...(ans.improvementSuggestions || []));
  }

  const overallScore = Math.round(totalScore / totalQuestions);
  const confidenceScore = Math.round(totalConfidence / totalQuestions);
  const communicationScore = Math.round(totalCommunication / totalQuestions);
  const averageTimePerQuestion = Math.round(totalTime / totalQuestions);
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

  let timeManagementScore = 70;
  if (averageTimePerQuestion <= 45) timeManagementScore = 90;
  else if (averageTimePerQuestion <= 75) timeManagementScore = 75;
  else if (averageTimePerQuestion <= 120) timeManagementScore = 60;
  else timeManagementScore = 40;

  return {
    overallScore,
    accuracy,
    confidenceScore,
    communicationScore,
    timeManagementScore,
    averageTimePerQuestion,
    totalQuestions,
    correctAnswers,
    incorrectAnswers: totalQuestions - correctAnswers - unanswered,
    unansweredQuestions: unanswered,
    strengths: [...new Set(strengths)],
    weaknesses: [...new Set(weaknesses)],
    improvementSuggestions: [...new Set(suggestions)],
    finalRating: buildFinalRating(overallScore),
    hireRecommendation: buildHireRecommendation(overallScore)
  };
};

module.exports = {
  buildFinalRating,
  buildHireRecommendation,
  generateInterviewSummary,
  calculateResultFromInterview
};