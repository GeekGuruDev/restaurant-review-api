const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true, // Remove whitespace
    },
    description: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Please provide a address"],
      trim: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location", // Reference to the Location model
      required: [true, "Please provide a location"],
    },
    cuisine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cuisine", // Reference to the Cuisine model
      required: [true, "Please provide a cuisine"],
    },
    priceRange: {
      type: String,
      enum: ["$", "$$", "$$$", "$$$$"], // Allowed values
      required: [true, "Please provide price range"],
    },
    averageRating: {
      type: Number,
      default: 0, // Default value of 0
    },
    images: [
      {
        type: String, // Array of image URLs
      },
    ],
    slug: {
      type: String,
      unique: true, // Ensure unique slugs
      lowercase: true, // Store slugs in lowercase
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model (restaurant owner)
      required: [true, "Please provide a owner"],
    },
    menu: [
      {
        // Embedded menu items
        name: {
          type: String,
          required: [true, "Please provide a menu name"],
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        price: {
          type: Number,
          required: [true, "Please provide a menu price"],
        },
        category: {
          // e.g., Appetizers, Mains, Desserts
          type: String,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true, // Add createdAt and updatedAt fields automatically
  }
);

restaurantSchema.pre(/^find/, function (next) {
  this.select("-__v");
  next();
});

restaurantSchema.pre("findOne", function (next) {
  this.populate({
    path: "owner",
    select: "-__v -password -refreshTokens -createdAt -updatedAt",
  })
    .populate({ path: "location", select: "-__v" })
    .populate({ path: "cuisine", select: "-__v" });
  next();
});

restaurantSchema.pre("save", function (next) {
  if (this.isModified("name") || !this.slug) {
    this.slug = generateSlug(this.name);
  }
  next();
});

restaurantSchema.statics.updateSlug = async function (query, update) {
  // Static method on the model
  if (update.$set && update.$set.name) {
    // Check if the name is being updated
    update.$set.slug = generateSlug(update.$set.name);
  }
  return this.updateOne(query, update);
};

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]/g, "-") // Replace non-alphanumeric characters with '-'
    .replace(/-+/g, "-") // Replace multiple '-' with a single '-'
    .replace(/^-|-$/g, ""); // Remove leading and trailing '-'
}

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;
