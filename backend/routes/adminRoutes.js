const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { adminProtect } = require("../middleware/adminMiddleware");
const {
  getDashboardStats,
  getAllUsers,
  getUserDetail,
  deleteUser,
  toggleAdminRole,
  getAllSearches,
  deleteSearch,
  getPlatformActivity,
  getRecentActivity,
} = require("../controllers/adminController");

// All admin routes require authentication + admin role
router.use(protect, adminProtect);

// Dashboard
router.get("/stats", getDashboardStats);

// User management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserDetail);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/role", toggleAdminRole);

// Searches
router.get("/searches", getAllSearches);
router.delete("/searches/:id", deleteSearch);

// Activity
router.get("/activity", getPlatformActivity);
router.get("/activity/recent", getRecentActivity);

module.exports = router;
