const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getSearchHistory } = require("../controllers/historyController");

router.get("/", protect, getSearchHistory);

module.exports = router;
