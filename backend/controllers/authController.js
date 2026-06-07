const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const signupUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, targetRole, experienceLevel, skills } = req.body;

  if (!fullName || !email || !password) {
    res.status(400);
    throw new Error("Full name, email, and password are required");
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(400);
    throw new Error("User already exists with this email");
  }

  const user = await User.create({
    fullName,
    email,
    password,
    targetRole,
    experienceLevel,
    skills: Array.isArray(skills) ? skills : []
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      targetRole: user.targetRole,
      experienceLevel: user.experienceLevel,
      skills: user.skills,
      token
    }
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      targetRole: user.targetRole,
      experienceLevel: user.experienceLevel,
      skills: user.skills,
      token
    }
  });
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});

module.exports = {
  signupUser,
  loginUser,
  getMe
};