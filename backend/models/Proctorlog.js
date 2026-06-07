const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: [
        "tab-switch",
        "window-blur",
        "multiple-faces",
        "no-face-detected",
        "copy-paste-attempt",
        "screen-left",
        "suspicious-audio",
        "mobile-detected",
        "other"
      ],
      required: true
    },

    description: {
      type: String,
      default: ""
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    },

    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const proctorLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true
    },

    events: {
      type: [eventSchema],
      default: []
    },

    totalWarnings: {
      type: Number,
      default: 0
    },

    highSeverityCount: {
      type: Number,
      default: 0
    },

    cheatingSuspicionScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    status: {
      type: String,
      enum: ["clean", "warning", "flagged"],
      default: "clean"
    }
  },
  {
    timestamps: true
  }
);

const ProctorLog = mongoose.model("ProctorLog", proctorLogSchema);

module.exports = ProctorLog;
/*Ye cheating / suspicious events ka record hai:

tab switch
no face detected
multiple faces
copy paste
suspicious aud */