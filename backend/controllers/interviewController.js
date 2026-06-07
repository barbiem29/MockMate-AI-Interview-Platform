const { generateQuestionWithLLM } = require("../utils/llmQuestionGenerator");
const asyncHandler  = require("express-async-handler");
const Interview     = require("../models/Interview");
const Question      = require("../models/Question");
const Result        = require("../models/Result");
const ProctorLog    = require("../models/ProctorLog");
const { evaluateAnswer }    = require("../utils/aiEvaluator");
const { evaluateWithLLM }   = require("../utils/llmEvaluator");
const { getNextDifficulty } = require("../utils/aiQuestionGenerator");
const {
  calculateResultFromInterview,
  buildFinalRating,
  buildHireRecommendation,
  generateInterviewSummary
} = require("../utils/scoringEngine");

const MAX_QUESTIONS = 10;

/* ── START INTERVIEW ─────────────────────────────── */
const startInterview = asyncHandler(async (req, res) => {
  const {
    interviewTitle,
    interviewType       = "mixed",
    companyMode         = "general",
    targetRole          = "",
    experienceLevel     = "beginner",
    skillsTargeted      = [],
    adaptiveModeEnabled = true,
    voiceModeEnabled    = false,
    proctoringEnabled   = true,
    resumeUsed          = false,
    resumeFileUrl       = "",
    resumeText          = ""
  } = req.body;

  const sessionSeed = `${req.user._id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  console.log(`[START] user=${req.user._id} type=${interviewType} seed=${sessionSeed}`);

  const firstQuestionData = await generateQuestionWithLLM({
    interviewType,
    difficulty:        "medium",
    companyMode,
    targetRole,
    skillsTargeted,
    previousQuestions: [],
    resumeText,
    preferMCQ:         true,
    sessionSeed
  });

  const firstQuestion = await Question.create({
    ...firstQuestionData,
    generatedByAI: true,
    sourceType:    "ai"
  });

  console.log(`[START] First question created: ${firstQuestion._id} — "${firstQuestion.questionText.slice(0, 60)}"`);

  const interview = await Interview.create({
    user:               req.user._id,
    interviewTitle:     interviewTitle || "Mock Interview Session",
    interviewType,
    companyMode,
    targetRole,
    experienceLevel,
    skillsTargeted,
    adaptiveModeEnabled,
    voiceModeEnabled,
    proctoringEnabled,
    resumeUsed,
    resumeFileUrl,
    resumeText,
    sessionSeed,
    currentDifficulty:  "medium",
    questions:          [firstQuestion._id],
    status:             "in-progress"
  });

  await ProctorLog.create({
    user:                   req.user._id,
    interview:              interview._id,
    events:                 [],
    totalWarnings:          0,
    highSeverityCount:      0,
    cheatingSuspicionScore: 0,
    status:                 "clean"
  });

  console.log(`[START] Interview created: ${interview._id}`);

  res.status(201).json({
    success: true,
    message: "Interview started",
    data:    { interview, firstQuestion }
  });
});


/* ── GET INTERVIEW ───────────────────────────────── */
const getInterviewById = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({
    _id:  req.params.id,
    user: req.user._id
  })
    .populate("questions")
    .populate("user", "fullName email");

  if (!interview) { res.status(404); throw new Error("Interview not found"); }

  res.status(200).json({ success: true, data: interview });
});


/* ── GET NEXT QUESTION ───────────────────────────── */
const getNextQuestion = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({
    _id:  req.params.id,
    user: req.user._id
  }).populate("questions");

  if (!interview) { res.status(404); throw new Error("Interview not found"); }

  if (interview.status === "completed" || interview.status === "terminated") {
    return res.status(200).json({ success: true, data: null });
  }

  const answeredCount = interview.answers.length;
  const totalCreated  = interview.questions.length;

  console.log(`[NEXT_Q] answered=${answeredCount} created=${totalCreated} max=${MAX_QUESTIONS}`);

  // All 10 answered
  if (answeredCount >= MAX_QUESTIONS) {
    return res.status(200).json({ success: true, data: null });
  }

  // Unanswered question already exists — return it
  if (totalCreated > answeredCount) {
    const nextQ = interview.questions[answeredCount];
    console.log(`[NEXT_Q] Returning existing Q${answeredCount + 1}: "${nextQ.questionText?.slice(0, 50)}"`);
    return res.status(200).json({ success: true, data: nextQ });
  }

  // Need to generate next question
  const sessionPrev = interview.answers.map(a => a.questionText).filter(Boolean);

  const pastInterviews = await Interview.find({
    user:   req.user._id,
    _id:    { $ne: interview._id },
    status: "completed"
  }).select("answers").limit(5);

  const pastPrev = pastInterviews
    .flatMap(iv => iv.answers.map(a => a.questionText))
    .filter(Boolean);

  const allPrev = [...new Set([...sessionPrev, ...pastPrev])];

  console.log(`[NEXT_Q] Generating Q${answeredCount + 1}, avoiding ${allPrev.length} used questions`);

  // generateQuestionWithLLM already has fallback built in — it NEVER throws
  const newQuestionData = await generateQuestionWithLLM({
    interviewType:     interview.interviewType,
    difficulty:        interview.currentDifficulty || "medium",
    companyMode:       interview.companyMode       || "general",
    targetRole:        interview.targetRole        || "",
    skillsTargeted:    interview.skillsTargeted    || [],
    previousQuestions: allPrev,
    resumeText:        interview.resumeText        || "",
    preferMCQ:         true,
    sessionSeed:       `${interview.sessionSeed || interview._id}_Q${answeredCount + 1}_${Date.now()}`
  });

  const newQuestion = await Question.create({
    ...newQuestionData,
    generatedByAI: true,
    sourceType:    "ai"
  });

  interview.questions.push(newQuestion._id);
  await interview.save();

  console.log(`[NEXT_Q] Created Q${answeredCount + 1}: "${newQuestion.questionText.slice(0, 60)}"`);

  return res.status(200).json({ success: true, data: newQuestion });
});


/* ── SUBMIT ANSWER ───────────────────────────────── */
const submitAnswer = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const {
    userAnswerText     = "",
    selectedOption     = "",
    transcriptText     = "",
    timeTakenInSeconds = 0
  } = req.body;

  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
  if (!interview) { res.status(404); throw new Error("Interview not found"); }
  if (interview.status !== "in-progress") { res.status(400); throw new Error("Interview not in progress"); }

  const question = await Question.findById(questionId);
  if (!question) { res.status(404); throw new Error("Question not found"); }

  console.log(`[SUBMIT] Q=${questionId} type=${question.questionType} interview=${interview._id}`);

  let isCorrect = false;
  if (question.questionType === "mcq") {
    isCorrect = !!(selectedOption && question.correctAnswer &&
      selectedOption.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase());
  }

  const answerText = userAnswerText || selectedOption;

  const evaluation = evaluateAnswer({
    userAnswerText: answerText,
    idealAnswer:    question.idealAnswer,
    keywords:       question.keywords,
    questionType:   question.questionType
  });

  const llmEvaluation = await evaluateWithLLM({
    questionType:     question.questionType,
    questionText:     question.questionText,
    idealAnswer:      question.idealAnswer,
    expectedKeywords: question.keywords,
    userAnswerText:   answerText
  });

  const mergedFinalScore         = Math.round(evaluation.finalScore        * 0.5 + llmEvaluation.finalScore        * 0.5);
  const mergedConfidenceScore    = Math.round(evaluation.confidenceScore    * 0.5 + llmEvaluation.confidenceScore    * 0.5);
  const mergedCommunicationScore = Math.round(evaluation.communicationScore * 0.5 + llmEvaluation.communicationScore * 0.5);
  const finalCorrectFlag         = question.questionType === "mcq" ? isCorrect : mergedFinalScore >= 60;

  interview.answers.push({
    question:              question._id,
    questionText:          question.questionText,
    questionType:          question.questionType,
    category:              question.category,
    difficulty:            question.difficulty,
    selectedOption,
    userAnswerText,
    transcriptText,
    aiGeneratedFollowUp:   question.questionType === "follow-up",
    isCorrect:             finalCorrectFlag,
    semanticScore:         evaluation.semanticScore,
    keywordScore:          evaluation.keywordScore,
    finalScore:            mergedFinalScore,
    confidenceScore:       mergedConfidenceScore,
    communicationScore:    mergedCommunicationScore,
    llmConceptualScore:    llmEvaluation.conceptualScore,
    llmCommunicationScore: llmEvaluation.communicationScore,
    llmStructureScore:     llmEvaluation.structureScore,
    llmConfidenceScore:    llmEvaluation.confidenceScore,
    hireSignal:            llmEvaluation.hireSignal,
    strengths:             [...new Set([...(evaluation.strengths || []), ...(llmEvaluation.strengths || [])])],
    weaknesses:            [...new Set([...(evaluation.weaknesses || []), ...(llmEvaluation.weaknesses || [])])],
    improvementSuggestions:[...new Set([...(evaluation.improvementSuggestions || []), ...(llmEvaluation.improvementSuggestions || [])])],
    timeTakenInSeconds,
    askedAt:    new Date(),
    answeredAt: new Date()
  });

  if (interview.adaptiveModeEnabled) {
    interview.currentDifficulty = getNextDifficulty(interview.currentDifficulty, mergedFinalScore);
  }

  await interview.save();

  console.log(`[SUBMIT] Answer saved. Total answers: ${interview.answers.length}`);

  res.status(200).json({
    success: true,
    message: "Answer submitted",
    data: {
      localEvaluation: evaluation,
      llmEvaluation,
      mergedFinalScore,
      nextDifficulty: interview.currentDifficulty
    }
  });
});


/* ── END INTERVIEW ───────────────────────────────── */
const endInterview = asyncHandler(async (req, res) => {
  const interview = await Interview.findOne({ _id: req.params.id, user: req.user._id });
  if (!interview) { res.status(404); throw new Error("Interview not found"); }

  console.log(`[END] interview=${interview._id} answers=${interview.answers.length}`);

  // No answers — terminate, do NOT generate report
  if (!interview.answers || interview.answers.length === 0) {
    interview.status = "terminated";
    await interview.save();
    return res.status(400).json({
      success:    false,
      terminated: true,
      message:    "Interview terminated due to a technical issue. We apologize for the inconvenience and will investigate the problem."
    });
  }

  interview.endTime = new Date();
  interview.status  = "completed";

  if (interview.startTime) {
    interview.totalDurationInSeconds = Math.max(
      0,
      Math.round((interview.endTime - new Date(interview.startTime)) / 1000)
    );
  }

  const computed               = calculateResultFromInterview(interview);
  interview.overallScore       = computed.overallScore;
  interview.overallConfidenceScore = computed.confidenceScore;
  interview.finalRating        = buildFinalRating(computed.overallScore);
  interview.hireRecommendation = buildHireRecommendation(computed.overallScore);
  interview.aiSummary          = generateInterviewSummary({
    overallScore:    computed.overallScore,
    confidenceScore: computed.confidenceScore,
    strengths:       computed.strengths,
    weaknesses:      computed.weaknesses,
    suggestions:     computed.improvementSuggestions
  });

  await interview.save();

  // Build skill breakdown
  const groupedBySkill = {};
  for (const ans of interview.answers) {
    const key = ans.category || "General";
    if (!groupedBySkill[key]) {
      groupedBySkill[key] = { skillName: key, score: 0, totalQuestions: 0, correctAnswers: 0, _timeSum: 0 };
    }
    groupedBySkill[key].score          += ans.finalScore || 0;
    groupedBySkill[key].totalQuestions += 1;
    groupedBySkill[key].correctAnswers += ans.isCorrect ? 1 : 0;
    groupedBySkill[key]._timeSum       += ans.timeTakenInSeconds || 0;
  }

  const skillBreakdown = Object.values(groupedBySkill).map(item => ({
    skillName:        item.skillName,
    score:            Math.round(item.score / item.totalQuestions),
    totalQuestions:   item.totalQuestions,
    correctAnswers:   item.correctAnswers,
    averageTimeTaken: Math.round(item._timeSum / item.totalQuestions)
  }));

  const resultPayload = {
    user:                   req.user._id,
    interview:              interview._id,
    overallScore:           computed.overallScore,
    accuracy:               computed.accuracy,
    confidenceScore:        computed.confidenceScore,
    communicationScore:     computed.communicationScore,
    timeManagementScore:    computed.timeManagementScore,
    averageTimePerQuestion: computed.averageTimePerQuestion,
    totalQuestions:         computed.totalQuestions,
    correctAnswers:         computed.correctAnswers,
    incorrectAnswers:       computed.incorrectAnswers,
    unansweredQuestions:    computed.unansweredQuestions,
    skillBreakdown,
    strengths:              computed.strengths,
    weaknesses:             computed.weaknesses,
    improvementSuggestions: computed.improvementSuggestions,
    finalRating:            computed.finalRating,
    hireRecommendation:     computed.hireRecommendation,
    reportGenerated:        true,
    reportText:             interview.aiSummary
  };

  let result = await Result.findOne({ interview: interview._id });
  if (result) {
    Object.assign(result, resultPayload);
    await result.save();
  } else {
    result = await Result.create(resultPayload);
  }

  console.log(`[END] Report generated. Score=${computed.overallScore} Questions=${computed.totalQuestions}`);

  res.status(200).json({
    success: true,
    message: "Interview ended successfully",
    data:    { interview, result }
  });
});


module.exports = {
  startInterview,
  getInterviewById,
  getNextQuestion,
  submitAnswer,
  endInterview
};