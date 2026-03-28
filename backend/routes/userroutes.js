const express = require("express");
const router = express.Router();
const {
  createUser,
  loginUser,
  getUsers,
} = require("../controllers/userController");

router.post("/", createUser);
router.post("/login", loginUser);
router.get("/", getUsers);

module.exports = router;