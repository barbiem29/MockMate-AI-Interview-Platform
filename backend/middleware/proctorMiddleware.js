const validateProctorEvent = (req, res, next) => {
  const { eventType, severity } = req.body;

  if (!eventType) {
    return res.status(400).json({
      success: false,
      message: "eventType is required"
    });
  }

  if (severity && !["low", "medium", "high"].includes(severity)) {
    return res.status(400).json({
      success: false,
      message: "Invalid severity"
    });
  }

  next();
};

module.exports = { validateProctorEvent };