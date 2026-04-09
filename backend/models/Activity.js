const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["search", "tryon"],
      required: true,
    },
    metadata: {
      imageUrl: String,
      matchesCount: Number,
      garmentName: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient date-range queries
activitySchema.index({ userId: 1, createdAt: -1 });

const Activity = mongoose.model("Activity", activitySchema);

module.exports = Activity;
