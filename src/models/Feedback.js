// src/models/Feedback.js

const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    resource_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resource",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    helpful: {
      type: Boolean,
      default: true,
    },
    comment: {
      type: String,
      maxlength: 500,
    },
    // No personal identifying information stored
    session_id: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
