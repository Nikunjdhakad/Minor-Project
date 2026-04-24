const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getSearchHistory, deleteHistoryItem, clearAllHistory } = require("../controllers/historyController");

router.get("/", protect, getSearchHistory);
router.delete("/all", protect, clearAllHistory);
router.delete("/:id", protect, deleteHistoryItem);

module.exports = router;
