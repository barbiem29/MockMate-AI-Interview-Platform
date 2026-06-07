const normalizeText = (text = "") => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const getWordSet = (text = "") => {
  return new Set(normalizeText(text).split(" ").filter(Boolean));
};

const scoreKeywordMatch = (answer = "", keywords = []) => {
  if (!keywords || keywords.length === 0) return 50;

  const answerSet = getWordSet(answer);
  let matched = 0;

  for (const keyword of keywords) {
    const key = normalizeText(keyword);
    if (key && answerSet.has(key)) {
      matched++;
    }
  }

  return Math.round((matched / keywords.length) * 100);
};

const scoreSemanticLike = (answer = "", idealAnswer = "") => {
  if (!idealAnswer || !idealAnswer.trim()) {
    const len = normalizeText(answer).split(" ").filter(Boolean).length;
    if (len >= 25) return 75;
    if (len >= 12) return 60;
    if (len >= 6) return 45;
    return 25;
  }

  const answerWords = getWordSet(answer);
  const idealWords = getWordSet(idealAnswer);

  if (idealWords.size === 0) return 50;

  let common = 0;
  for (const word of idealWords) {
    if (answerWords.has(word)) common++;
  }

  return Math.round((common / idealWords.size) * 100);
};

const inferStrengths = ({ keywordScore, semanticScore, answerLength }) => {
  const strengths = [];

  if (keywordScore >= 70) strengths.push("Good keyword coverage");
  if (semanticScore >= 70) strengths.push("Relevant conceptual explanation");
  if (answerLength >= 20) strengths.push("Answer has reasonable detail");

  return strengths;
};

const inferWeaknesses = ({ keywordScore, semanticScore, answerLength }) => {
  const weaknesses = [];

  if (keywordScore < 50) weaknesses.push("Missed important terms");
  if (semanticScore < 50) weaknesses.push("Answer lacks conceptual alignment");
  if (answerLength < 8) weaknesses.push("Answer is too brief");

  return weaknesses;
};

const inferSuggestions = ({ keywordScore, semanticScore, answerLength, questionType }) => {
  const suggestions = [];

  if (keywordScore < 60) {
    suggestions.push("Include more core technical terms from the topic");
  }

  if (semanticScore < 60) {
    suggestions.push("Explain the concept in a more structured way with correct logic");
  }

  if (answerLength < 10 && questionType !== "mcq") {
    suggestions.push("Elaborate your answer with definition, working, and example");
  }

  if (questionType === "behavioral") {
    suggestions.push("Use a situation-action-result style response");
  }

  return suggestions;
};

const evaluateAnswer = ({
  userAnswerText = "",
  idealAnswer = "",
  keywords = [],
  questionType = "technical"
}) => {
  const cleaned = normalizeText(userAnswerText);
  const answerLength = cleaned ? cleaned.split(" ").length : 0;

  if (!cleaned) {
    return {
      semanticScore: 0,
      keywordScore: 0,
      finalScore: 0,
      confidenceScore: 0,
      communicationScore: 0,
      strengths: [],
      weaknesses: ["No answer submitted"],
      improvementSuggestions: ["Attempt the question with a structured answer"]
    };
  }

  const keywordScore = scoreKeywordMatch(userAnswerText, keywords);
  const semanticScore = scoreSemanticLike(userAnswerText, idealAnswer);

  let communicationScore = 50;
  if (answerLength >= 25) communicationScore = 85;
  else if (answerLength >= 15) communicationScore = 72;
  else if (answerLength >= 8) communicationScore = 60;
  else communicationScore = 40;

  let confidenceScore = 50;
  if (answerLength >= 20) confidenceScore += 15;
  if (keywordScore >= 60) confidenceScore += 15;
  if (semanticScore >= 60) confidenceScore += 10;
  confidenceScore = Math.min(100, confidenceScore);

  const finalScore = Math.round(
    keywordScore * 0.35 +
    semanticScore * 0.45 +
    communicationScore * 0.20
  );

  return {
    semanticScore,
    keywordScore,
    finalScore,
    confidenceScore,
    communicationScore,
    strengths: inferStrengths({ keywordScore, semanticScore, answerLength }),
    weaknesses: inferWeaknesses({ keywordScore, semanticScore, answerLength }),
    improvementSuggestions: inferSuggestions({
      keywordScore,
      semanticScore,
      answerLength,
      questionType
    })
  };
};

module.exports = {
  evaluateAnswer
};