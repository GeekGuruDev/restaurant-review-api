const { UnauthorizedError } = require("../errors/customeErrors");
const User = require("../models/userModel");
const asyncHandler = require("../utils/asyncHandler");
const { deleteOne, updateOne, getOne, getAll } = require("./handleFactory");

exports.setCurretUserId = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.updateMe = asyncHandler(async (req, res, next) => {
  if (req.body.password) {
    return next(
      new UnauthorizedError(
        "Password is not allowed to update. Use /api/user/me/password"
      )
    );
  }

  const allowedFields = ["username", "email", "profilePicture"];
  const newObj = {};
  Object.keys(req.body).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = req.body[el];
    }
  });

  const updatedUser = await User.findByIdAndUpdate(req.user.id, newObj, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.getAllUsers = getAll(User);
exports.getUser = getOne(User);
exports.updateUser = updateOne(User);
exports.deleteUser = deleteOne(User);
