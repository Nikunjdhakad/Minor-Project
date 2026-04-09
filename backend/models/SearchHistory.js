const mongoose = require("mongoose");

const searchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    matchesCount: {
      type: Number,
      default: 0,
    },
    matches: [
      {
        name: String,
        imageUrl: String,
        shopLink: String,
        price: String,
        matchScore: Number,
        source: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for pagination
searchHistorySchema.index({ userId: 1, createdAt: -1 });

const SearchHistory = mongoose.model("SearchHistory", searchHistorySchema);

module.exports = SearchHistory;
