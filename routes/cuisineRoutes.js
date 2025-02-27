const express = require("express");
const { authorizeRoles, protect } = require("../controllers/authController");
const {
  getAllCuisine,
  createCuisine,
  getCuisine,
  updateCuisine,
  deleteCuisine,
} = require("../controllers/cuisineController");

const router = express.Router();

router
  .route("/")
  .get(getAllCuisine)
  .post(protect, authorizeRoles(["admin"]), createCuisine);

router
  .route("/:id")
  .get(getCuisine)
  .patch(protect, authorizeRoles(["admin"]), updateCuisine)
  .delete(protect, authorizeRoles(["admin"]), deleteCuisine);

module.exports = router;
