const mongoose = require("mongoose");

const skillBreakdownSchema = new mongoose.Schema(
  {
    skillName: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    totalQuestions: {
      type: Number,
      default: 0
    },
    correctAnswers: {
      type: Number,
      default: 0
    },
    averageTimeTaken: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
      unique: true
    },

    overallScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    accuracy: {
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

    timeManagementScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    averageTimePerQuestion: {
      type: Number,
      default: 0
    },

    totalQuestions: {
      type: Number,
      default: 0
    },

    correctAnswers: {
      type: Number,
      default: 0
    },

    incorrectAnswers: {
      type: Number,
      default: 0
    },

    unansweredQuestions: {
      type: Number,
      default: 0
    },

    skillBreakdown: {
      type: [skillBreakdownSchema],
      default: []
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

    performanceTrendTag: {
      type: String,
      enum: ["Improving", "Stable", "Declining", "First Attempt"],
      default: "First Attempt"
    },

    reportGenerated: {
      type: Boolean,
      default: false
    },

    reportText: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

const Result = mongoose.model("Result", resultSchema);

module.exports = Result;
/*Ye final analytics table hai:

overall score
skill-wise breakdown
accuracy
confidence
final recommendation*/