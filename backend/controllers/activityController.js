const Activity = require("../models/Activity");

// Get activity stats for last 7 days (aggregated by day)
const getActivity = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const activities = await Activity.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
          searches: {
            $sum: { $cond: [{ $eq: ["$type", "search"] }, 1, 0] },
          },
          tryons: {
            $sum: { $cond: [{ $eq: ["$type", "tryon"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing days with zero counts
    const result = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayName = days[date.getDay()];

      const found = activities.find((a) => a._id === dateStr);
      result.push({
        date: dateStr,
        day: dayName,
        count: found ? found.count : 0,
        searches: found ? found.searches : 0,
        tryons: found ? found.tryons : 0,
      });
    }

    // Also get total counts
    const totalActivity = await Activity.countDocuments({
      userId: req.user._id,
    });

    res.json({
      daily: result,
      totalActivity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Log a new activity (called internally from other controllers)
const logActivity = async (userId, type, metadata = {}) => {
  try {
    await Activity.create({ userId, type, metadata });
  } catch (error) {
    console.error("Failed to log activity:", error.message);
  }
};

module.exports = { getActivity, logActivity };
