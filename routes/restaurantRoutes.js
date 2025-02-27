const express = require("express");
const {
  getAllRestaurants,
  createRestaurant,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant,
  setOwner,
  authorizeOwner,
} = require("../controllers/restaurantController");
const { authorizeRoles, protect } = require("../controllers/authController");
const reviewRouter = require("./reviewRoutes");

const router = express.Router();

router.use("/:restaurantId/reviews", reviewRouter);

router
  .route("/")
  .get(getAllRestaurants)
  .post(
    protect,
    authorizeRoles(["owner", "admin"]),
    setOwner,
    createRestaurant
  );

router
  .route("/:id")
  .get(getRestaurant)
  .patch(
    protect,
    authorizeRoles(["owner", "admin"]),
    authorizeOwner,
    setOwner,
    updateRestaurant
  )
  .delete(
    protect,
    authorizeRoles(["owner", "admin"]),
    authorizeOwner,
    setOwner,
    deleteRestaurant
  );

module.exports = router;
