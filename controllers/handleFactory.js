const { NotFoundError } = require("../errors/customeErrors");
const asyncHandler = require("../utils/asyncHandler");
const queryBuilder = require("../utils/queryBuilder");

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new NotFoundError(`${Model.modelName} not found`));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    if (Model.modelName === "Restaurant" && req.body.name) {
      await Model.updateSlug({ _id: id }, { $set: { name: req.body.name } });
    }

    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new NotFoundError(`${Model.modelName} not found`));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      data: newDoc,
    });
  });

exports.getOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    if (!doc) {
      return next(new NotFoundError(`${Model.modelName} not found`));
    }

    res.status(200).json({
      status: "success",
      data: doc,
    });
  });

exports.getAll = (Model, popArray = []) =>
  asyncHandler(async (req, res, next) => {
    const { restaurantId } = req.params;
    const filter = restaurantId ? { restaurant: restaurantId } : {};
    let queryChain = Model.find(filter);

    const fields = req.query.fields
      ? req.query.fields?.split(",")
      : popArray.map((pop) => pop.path);

    popArray.forEach((pop) => {
      if (fields.includes(pop.path)) {
        queryChain.find().populate(pop);
      }
    });

    queryChain = queryBuilder(queryChain, req.query);
    const doc = await queryChain;

    res.status(200).json({
      status: "success",
      results: doc.length,
      data: doc,
    });
  });
