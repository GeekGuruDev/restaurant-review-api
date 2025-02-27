const express = require("express");
const {
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  getReview,
  checkRestaurantExist,
  setReviewer,
  authorizeReviewer,
} = require("../controllers/reviewController");
const { protect } = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(getAllReviews)
  .post(protect, checkRestaurantExist, setReviewer, createReview);

router
  .route("/:id")
  .get(getReview)
  .patch(protect, authorizeReviewer, setReviewer, updateReview)
  .delete(protect, authorizeReviewer, setReviewer, deleteReview);

module.exports = router;
