const mongoose = require("mongoose");
const Restaurant = require("./restaurantModel");

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 0,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500, // Limit comment length
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
  },
  {
    timestamps: true, // Add createdAt and updatedAt fields automatically
  }
);

reviewSchema.index({ restaurant: 1, reviewer: 1 }, { unique: true }); // Compound index

reviewSchema.pre("findOne", function (next) {
  this.populate({
    path: "reviewer",
    select: "-__v -password -refreshTokens -createdAt -updatedAt",
  });
  next();
});

reviewSchema.post("save", async function (doc) {
  // 'doc' is the saved review
  await updateAverageRating(doc.restaurant);
});

reviewSchema.post("delete", async function (doc) {
  await updateAverageRating(doc.restaurant);
});

reviewSchema.post("findOneAndUpdate", async function (doc) {
  // For findByIdAndUpdate
  if (doc) {
    // Check if a document was actually found and updated
    await updateAverageRating(doc.restaurant);
  }
});

const Review = mongoose.model("Review", reviewSchema);

// Helper function to update average rating
async function updateAverageRating(restaurantId) {
  try {
    const result = await Review.aggregate([
      { $match: { restaurant: restaurantId } },
      { $group: { _id: "$restaurant", averageRating: { $avg: "$rating" } } },
    ]);

    if (result.length > 0) {
      await Restaurant.findByIdAndUpdate(restaurantId, {
        averageRating: result[0].averageRating,
      });
    } else {
      await Restaurant.findByIdAndUpdate(restaurantId, { averageRating: 0 }); // No reviews, set to 0
    }
  } catch (error) {
    console.error("Error updating average rating:", error);
  }
}

module.exports = Review;
