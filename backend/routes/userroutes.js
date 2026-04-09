const express = require("express");
const router = express.Router();
const {
  createUser,
  loginUser,
  getUsers,
  getUserProfile,
} = require("../controllers/userController");
const { updateProfile } = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", createUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateProfile);
router.get("/", protect, getUsers);

module.exports = router;