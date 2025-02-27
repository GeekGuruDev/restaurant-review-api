const { ForbiddenError } = require("../errors/customeErrors");
const Restaurant = require("../models/restaurantModel");
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require("./handleFactory");

exports.setOwner = (req, res, next) => {
  req.body.owner = req.user._id;
  next();
};

exports.authorizeOwner = async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);

  if (
    restaurant &&
    req.user.role !== "admin" &&
    req.user._id.toString() !== restaurant.owner._id.toString()
  ) {
    return next(
      new ForbiddenError("Not allowed to update or delete other's restaurant.")
    );
  }
  next();
};

exports.getAllRestaurants = getAll(Restaurant, [
  {
    path: "owner",
    select: "username",
  },
  {
    path: "location",
    select: "-__v",
  },
  {
    path: "cuisine",
    select: "-__v",
  },
]);

exports.getRestaurant = getOne(Restaurant);
exports.createRestaurant = createOne(Restaurant);
exports.updateRestaurant = updateOne(Restaurant, { creator: "owner" });
exports.deleteRestaurant = deleteOne(Restaurant, { creator: "owner" });
