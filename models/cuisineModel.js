const mongoose = require("mongoose");

const cuisineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide city name."],
    unique: true,
    trim: true,
  },
});

const Cuisine = mongoose.model("Cuisine", cuisineSchema);

module.exports = Cuisine;
