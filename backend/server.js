const express  = require("express");
const dotenv   = require("dotenv");
const cors     = require("cors");
const morgan   = require("morgan");
const multer   = require("multer");
const path     = require("path");
const fs       = require("fs");

dotenv.config();

const connectDB        = require("./config/db");
const authRoutes       = require("./routes/authRoutes");
const userRoutes       = require("./routes/userRoutes");
const questionRoutes   = require("./routes/questionRoutes");
const interviewRoutes  = require("./routes/interviewRoutes");
const resultRoutes     = require("./routes/resultRoutes");
const proctorRoutes    = require("./routes/proctorRoutes");
const adminRoutes      = require("./routes/adminRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

connectDB();

const app = express();

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Resume upload setup ────────────────────────────
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) =>
    cb(null, `resume_${Date.now()}${path.extname(file.originalname)}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are supported"), false);
    }
  }
});

// ── Resume parse endpoint ──────────────────────────
app.post("/api/resume/parse", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please attach a PDF file."
      });
    }

    console.log(`[RESUME] Received file: ${req.file.originalname} (${req.file.size} bytes)`);

    const { parseResumePdf } = require("./utils/resumeParser");
    const result = await parseResumePdf(req.file.path);

    // Delete temp file after parsing
    fs.unlink(req.file.path, (err) => {
      if (err) console.warn("[RESUME] Could not delete temp file:", err.message);
    });

    console.log(`[RESUME] Success. Skills found: ${result.extractedSkills.join(", ")}`);

    return res.status(200).json({
      success: true,
      data: {
        rawText:         result.rawText,
        extractedSkills: result.extractedSkills,
        pageCount:       result.pageCount
      }
    });

  } catch (err) {
    console.error("[RESUME] Route error:", err.message);

    // Clean up temp file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, () => {});
    }

    return res.status(500).json({
      success: false,
      message: err.message || "Failed to parse resume"
    });
  }
});

// ── API routes ─────────────────────────────────────
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "MockMate AI backend is running" });
});

app.use("/api/auth",       authRoutes);
app.use("/api/users",      userRoutes);
app.use("/api/questions",  questionRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/results",    resultRoutes);
app.use("/api/proctor",    proctorRoutes);
app.use("/api/admin",      adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));