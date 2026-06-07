const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const {
    fullName,
    targetRole,
    experienceLevel,
    skills,
    profilePicture
  } = req.body;

  if (fullName !== undefined) user.fullName = fullName;
  if (targetRole !== undefined) user.targetRole = targetRole;
  if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;
  if (profilePicture !== undefined) user.profilePicture = profilePicture;
  if (Array.isArray(skills)) user.skills = skills;

  const updatedUser = await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: updatedUser
  });
});

module.exports = {
  updateProfile
};