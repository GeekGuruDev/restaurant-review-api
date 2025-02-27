const Cuisine = require("../models/cuisineModel");

const {
  getAll,
  createOne,
  getOne,
  updateOne,
  deleteOne,
} = require("./handleFactory");

exports.getAllCuisine = getAll(Cuisine);
exports.createCuisine = createOne(Cuisine);
exports.getCuisine = getOne(Cuisine);
exports.updateCuisine = updateOne(Cuisine);
exports.deleteCuisine = deleteOne(Cuisine);
