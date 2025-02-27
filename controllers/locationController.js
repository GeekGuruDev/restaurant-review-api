const Location = require("../models/locationModel");

const {
  getAll,
  createOne,
  getOne,
  updateOne,
  deleteOne,
} = require("./handleFactory");

exports.getAllLocation = getAll(Location);
exports.createLocation = createOne(Location);
exports.getLocation = getOne(Location);
exports.updateLocation = updateOne(Location);
exports.deleteLocation = deleteOne(Location);
