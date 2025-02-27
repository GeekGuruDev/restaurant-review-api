const express = require("express");
const { authorizeRoles, protect } = require("../controllers/authController");
const {
  getAllLocation,
  createLocation,
  getLocation,
  updateLocation,
  deleteLocation,
} = require("../controllers/locationController");

const router = express.Router();

router
  .route("/")
  .get(getAllLocation)
  .post(protect, authorizeRoles(["admin"]), createLocation);

router
  .route("/:id")
  .get(getLocation)
  .patch(protect, authorizeRoles(["admin"]), updateLocation)
  .delete(protect, authorizeRoles(["admin"]), deleteLocation);

module.exports = router;
