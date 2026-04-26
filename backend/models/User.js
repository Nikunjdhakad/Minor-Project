const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const favoriteSchema = new mongoose.Schema({
  imageUrl: String,
  name: String,
  shopLink: String,
  price: String,
  matchScore: Number,
  description: String,
  tags: [String],
  savedAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    mobileNo: {
      type: String,
      required: [true, "Please add a mobile number"],
      unique: true,
    },
    username: {
      type: String,
      required: [true, "Please add a username"],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
    },
    stylePreference: {
      type: String,
      enum: ["minimalist", "streetwear", "vintage", "formal", "casual", ""],
      default: "",
    },
    fitPreference: {
      type: String,
      enum: ["slim", "regular", "relaxed", ""],
      default: "",
    },
    styleLevel: {
      type: String,
      default: "Fashion Forward",
    },
    uploadsCount: {
      type: Number,
      default: 0,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    favorites: [favoriteSchema],
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;