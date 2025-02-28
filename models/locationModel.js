const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  city: {
    type: String,
    required: [true, "Please provide city name."],
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    required: [true, "Please provide country."],
    trim: true,
  },
});

const Location = mongoose.model("Location", locationSchema);

module.exports = Location;
