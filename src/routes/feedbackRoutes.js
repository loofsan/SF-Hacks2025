// src/routes/feedbackRoutes.js

const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");

// Get all feedback (could be admin-only in production)
router.get("/", async (req, res) => {
  try {
    const feedback = await Feedback.find().populate("resource_id", "name");
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get feedback for a specific resource
router.get("/resource/:resourceId", async (req, res) => {
  try {
    const feedback = await Feedback.find({
      resource_id: req.params.resourceId,
    });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get aggregate feedback stats for a resource
router.get("/stats/resource/:resourceId", async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      { $match: { resource_id: req.params.resourceId } },
      {
        $group: {
          _id: "$resource_id",
          averageRating: { $avg: "$rating" },
          totalFeedback: { $sum: 1 },
          helpfulCount: {
            $sum: { $cond: ["$helpful", 1, 0] },
          },
        },
      },
    ]);

    res.json(
      stats[0] || { averageRating: 0, totalFeedback: 0, helpfulCount: 0 }
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit new feedback
router.post("/", async (req, res) => {
  // Generate a session ID if not provided
  if (!req.body.session_id) {
    req.body.session_id = Math.random().toString(36).substring(2, 15);
  }

  const feedback = new Feedback(req.body);
  try {
    const newFeedback = await feedback.save();
    res.status(201).json(newFeedback);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
