const User = require("../models/User");

// Create User
const createUser = async (req, res) => {
  try {
    const { fullName, name, email, password, age, birthDate, accountType, preference } = req.body;

    const displayName = fullName || name;

    const user = await User.create({
      name: displayName,
      email,
      password,
      age: age ? Number(age) : undefined,
      birthDate,
      accountType,
      preference
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && user.password === password) {
      res.json(user);
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Users
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createUser, loginUser, getUsers };