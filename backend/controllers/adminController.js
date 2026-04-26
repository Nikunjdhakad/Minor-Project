const User = require("../models/User");
const SearchHistory = require("../models/SearchHistory");
const Activity = require("../models/Activity");

// ──────────────────────────────────────────────
// 1. Dashboard Stats
// GET /api/admin/stats
// ──────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      totalSearches,
      todaySearches,
      newUsersThisWeek,
      activeUsersWeek,
      totalFavoritesAgg,
      searchesByDay,
    ] = await Promise.all([
      User.countDocuments(),
      SearchHistory.countDocuments(),
      SearchHistory.countDocuments({ createdAt: { $gte: todayStart } }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Activity.distinct("userId", { createdAt: { $gte: sevenDaysAgo } }).then((ids) => ids.length),
      User.aggregate([
        { $project: { favCount: { $size: { $ifNull: ["$favorites", []] } } } },
        { $group: { _id: null, total: { $sum: "$favCount" } } },
      ]),
      // 30-day daily search counts for chart
      SearchHistory.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const totalFavorites = totalFavoritesAgg.length > 0 ? totalFavoritesAgg[0].total : 0;

    // Fill 30-day chart data
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyChart = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const found = searchesByDay.find((d) => d._id === dateStr);
      dailyChart.push({
        date: dateStr,
        day: days[date.getDay()],
        count: found ? found.count : 0,
      });
    }

    res.json({
      totalUsers,
      totalSearches,
      totalFavorites,
      todaySearches,
      newUsersThisWeek,
      activeUsersWeek,
      dailyChart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// 2. Get All Users (paginated + searchable)
// GET /api/admin/users?page=1&limit=20&search=&sort=createdAt
// ──────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const sortField = req.query.sort || "createdAt";
    const sortOrder = req.query.order === "asc" ? 1 : -1;

    const query = search
      ? {
          $or: [
            { username: { $regex: search, $options: "i" } },
            { mobileNo: { $regex: search, $options: "i" } },
            { name: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password -favorites")
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    // Attach favorites count for each user
    const userIds = users.map((u) => u._id);
    const favCounts = await User.aggregate([
      { $match: { _id: { $in: userIds } } },
      { $project: { favCount: { $size: { $ifNull: ["$favorites", []] } } } },
    ]);
    const favMap = {};
    favCounts.forEach((f) => (favMap[f._id.toString()] = f.favCount));

    const enrichedUsers = users.map((u) => ({
      ...u,
      favoritesCount: favMap[u._id.toString()] || 0,
    }));

    res.json({
      users: enrichedUsers,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// 3. Get Single User Detail
// GET /api/admin/users/:id
// ──────────────────────────────────────────────
const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const [searchHistory, activityCount, recentActivity] = await Promise.all([
      SearchHistory.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20).lean(),
      Activity.countDocuments({ userId: user._id }),
      Activity.find({ userId: user._id }).sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    res.json({
      user,
      searchHistory,
      activityCount,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// 4. Delete User (+ associated data)
// DELETE /api/admin/users/:id
// ──────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent self-deletion
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    // Remove all associated data
    await Promise.all([
      SearchHistory.deleteMany({ userId: user._id }),
      Activity.deleteMany({ userId: user._id }),
      User.findByIdAndDelete(user._id),
    ]);

    res.json({ message: "User and associated data deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// 5. Toggle Admin Role
// PUT /api/admin/users/:id/role
// ──────────────────────────────────────────────
const toggleAdminRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent self-demotion
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot change your own admin role" });
    }

    user.isAdmin = !user.isAdmin;
    await user.save();

    res.json({
      _id: user._id,
      username: user.username,
      isAdmin: user.isAdmin,
      message: user.isAdmin ? "User promoted to admin" : "Admin demoted to regular user",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// 6. Get All Searches (platform-wide, paginated)
// GET /api/admin/searches?page=1&limit=20
// ──────────────────────────────────────────────
const getAllSearches = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [searches, total] = await Promise.all([
      SearchHistory.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "username mobileNo name")
        .lean(),
      SearchHistory.countDocuments(),
    ]);

    res.json({
      searches,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// 7. Delete a Search Entry
// DELETE /api/admin/searches/:id
// ──────────────────────────────────────────────
const deleteSearch = async (req, res) => {
  try {
    const search = await SearchHistory.findByIdAndDelete(req.params.id);
    if (!search) return res.status(404).json({ message: "Search entry not found" });
    res.json({ message: "Search entry deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// 8. Platform Activity Overview (30-day chart)
// GET /api/admin/activity
// ──────────────────────────────────────────────
const getPlatformActivity = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activities = await Activity.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          searches: { $sum: { $cond: [{ $eq: ["$type", "search"] }, 1, 0] } },
          tryons: { $sum: { $cond: [{ $eq: ["$type", "tryon"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyChart = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const found = activities.find((a) => a._id === dateStr);
      dailyChart.push({
        date: dateStr,
        day: days[date.getDay()],
        count: found ? found.count : 0,
        searches: found ? found.searches : 0,
        tryons: found ? found.tryons : 0,
      });
    }

    const totalActivity = await Activity.countDocuments();

    res.json({ dailyChart, totalActivity });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ──────────────────────────────────────────────
// 9. Recent Activity Feed (all users)
// GET /api/admin/activity/recent?limit=20
// ──────────────────────────────────────────────
const getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("userId", "username name")
      .lean();

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserDetail,
  deleteUser,
  toggleAdminRole,
  getAllSearches,
  deleteSearch,
  getPlatformActivity,
  getRecentActivity,
};
