const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true
    },

    questionText: {
      type: String,
      required: true
    },

    questionType: {
      type: String,
      enum: ["technical", "behavioral", "mcq", "follow-up"],
      required: true
    },

    category: {
      type: String,
      default: "General"
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium"
    },

    selectedOption: {
      type: String,
      default: ""
    },

    userAnswerText: {
      type: String,
      default: ""
    },

    transcriptText: {
      type: String,
      default: ""
    },

    aiGeneratedFollowUp: {
      type: Boolean,
      default: false
    },

    isCorrect: {
      type: Boolean,
      default: false
    },

    semanticScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    keywordScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    finalScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    confidenceScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    communicationScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    llmConceptualScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    llmCommunicationScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    llmStructureScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    llmConfidenceScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    hireSignal: {
      type: String,
      default: "Neutral"
    },

    strengths: {
      type: [String],
      default: []
    },

    weaknesses: {
      type: [String],
      default: []
    },

    improvementSuggestions: {
      type: [String],
      default: []
    },

    timeTakenInSeconds: {
      type: Number,
      default: 0
    },

    askedAt: {
      type: Date,
      default: Date.now
    },

    answeredAt: {
      type: Date
    }
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    interviewTitle: {
      type: String,
      default: "Mock Interview Session"
    },

    interviewType: {
      type: String,
      enum: ["technical", "behavioral", "mixed", "company-specific", "voice-based"],
      default: "mixed"
    },

    companyMode: {
      type: String,
      enum: ["general", "google", "amazon", "tcs", "infosys", "wipro", "microsoft"],
      default: "general"
    },

    targetRole: {
      type: String,
      default: ""
    },

    experienceLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner"
    },

    skillsTargeted: {
      type: [String],
      default: []
    },

    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
      }
    ],

    answers: {
      type: [answerSchema],
      default: []
    },

    currentDifficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium"
    },

    adaptiveModeEnabled: {
      type: Boolean,
      default: true
    },

    voiceModeEnabled: {
      type: Boolean,
      default: false
    },

    proctoringEnabled: {
      type: Boolean,
      default: true
    },



    startTime: {
      type: Date,
      default: Date.now
    },

    endTime: {
      type: Date
    },

    totalDurationInSeconds: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["not-started", "in-progress", "completed", "terminated"],
      default: "in-progress"
    },

    overallScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    overallConfidenceScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    finalRating: {
      type: String,
      enum: ["Excellent", "Good", "Average", "Needs Improvement", "Poor"],
      default: "Average"
    },

    hireRecommendation: {
      type: String,
      enum: ["Hire", "Borderline", "No Hire"],
      default: "Borderline"
    },

    aiSummary: {
      type: String,
      default: ""
    },

    sessionSeed: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const Interview = mongoose.model("Interview", interviewSchema);

module.exports = Interview;