const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true
    },

    questionType: {
      type: String,
      enum: ["technical", "behavioral", "mcq", "follow-up"],
      required: [true, "Question type is required"]
    },

    category: {
      type: String,
      enum: ["DSA", "DBMS", "OS", "CN", "OOPS", "HR", "Aptitude", "General"],
      default: "General"
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium"
    },

    options: {
      type: [String],
      default: []
    },

    correctAnswer: {
      type: String,
      default: ""
    },

    idealAnswer: {
      type: String,
      default: ""
    },

    keywords: {
      type: [String],
      default: []
    },

    expectedConcepts: {
      type: [String],
      default: []
    },

    companyTag: {
      type: String,
      default: ""
    },

    generatedByAI: {
      type: Boolean,
      default: false
    },

    sourceType: {
      type: String,
      enum: ["manual", "ai", "company-bank"],
      default: "manual"
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
/*Ye question bank hai. Isme:

technical
behavioral
mcq
resume-based
AI-generated
sab store honge.*/