const { NotFoundError, ForbiddenError } = require("../errors/customeErrors");
const Restaurant = require("../models/restaurantModel");
const Review = require("../models/reviewModel");
const asyncHandler = require("../utils/asyncHandler");
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require("./handleFactory");

exports.setReviewer = (req, res, next) => {
  req.body.reviewer = req.user._id;
  next();
};

exports.checkRestaurantExist = asyncHandler(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.body.restaurant);
  if (!restaurant) {
    return next(new NotFoundError("Restaurant not found"));
  }
  next();
});

exports.authorizeReviewer = async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (
    review &&
    req.user.role !== "admin" &&
    req.user._id.toString() !== review.reviewer._id.toString()
  ) {
    return next(
      new ForbiddenError("Not allowed to update or delete other's review.")
    );
  }
  next();
};

exports.getAllReviews = getAll(Review, [
  {
    path: "reviewer",
    select: "username",
  },
]);
exports.getReview = getOne(Review);
exports.createReview = createOne(Review);
exports.updateReview = updateOne(Review);
exports.deleteReview = deleteOne(Review);
