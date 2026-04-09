const SearchHistory = require("../models/SearchHistory");

// Get search history for current user (paginated)
const getSearchHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      SearchHistory.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SearchHistory.countDocuments({ userId: req.user._id }),
    ]);

    res.json({
      history,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Save a search to history (called internally from searchController)
const saveSearchHistory = async (userId, imageUrl, matches) => {
  try {
    await SearchHistory.create({
      userId,
      imageUrl,
      matchesCount: matches.length,
      matches: matches.slice(0, 12).map((m) => ({
        name: m.name,
        imageUrl: m.imageUrl,
        shopLink: m.shopLink,
        price: m.price,
        matchScore: m.matchScore,
        source: m.description,
      })),
    });
  } catch (error) {
    console.error("Failed to save search history:", error.message);
  }
};

module.exports = { getSearchHistory, saveSearchHistory };
