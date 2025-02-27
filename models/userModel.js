const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // For password hashing

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide a username"],
      unique: true,
      trim: true,
      lowercase: true, // Store usernames in lowercase
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, // Email validation regex
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6, // Set a minimum password length
      select: false, // Do not return the password in any query
    },
    role: {
      type: String,
      enum: ["user", "admin", "owner"], // Allowed roles
      default: "user",
    },
    resetPasswordToken: String, // For password reset functionality
    resetPasswordExpires: Date, // For password reset functionality
    refreshTokens: {
      type: [{ token: String, expiresAt: Date }],
      select: false,
    }, // Store refresh tokens
    bio: {
      // Add a bio field
      type: String,
      maxlength: 200, // Set a maximum length for the bio
    },
    profilePicture: {
      // Add profile picture field
      type: String,
      default: null, // You can set a default image URL here if you want
    },
  },

  {
    timestamps: true, // Add createdAt and updatedAt fields
  }
);

// Hash the password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if password changed
  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next();
  } catch (err) {
    return next(err);
  }
});

// Method to compare passwords during login
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw err;
  }
};

userSchema.methods.compareResetToken = async function (resetToken) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (err) {
    throw err;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
