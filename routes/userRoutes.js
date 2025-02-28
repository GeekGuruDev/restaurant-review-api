const express = require("express");
const {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  authorizeRoles,
  logout,
} = require("../controllers/authController");
const {
  getAllUsers,
  updateMe,
  getUser,
  updateUser,
  deleteUser,
  setCurretUserId,
} = require("../controllers/userController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);

router.use(protect);
router.post("/logout", logout);
router
  .route("/me")
  .get(setCurretUserId, getUser)
  .patch(setCurretUserId, updateMe)
  .delete(setCurretUserId, deleteUser);
router.patch("/me/password", updatePassword);

router.use(authorizeRoles(["admin"]));
router.get("/", getAllUsers);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
