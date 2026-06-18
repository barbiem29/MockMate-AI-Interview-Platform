const express  = require("express");
const dotenv   = require("dotenv");
const cors     = require("cors");
const morgan   = require("morgan");

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