module.exports = errorHandler = (err, req, res, next) => {
  switch (err.name) {
    case "CastError":
      err.statusCode = 404;
      break;
    case "ValidationError":
      err.statusCode = 400;
      break;
    case "JsonWebTokenError":
      err.statusCode = 401;
      break;
    case "TokenExpiredError":
      err.statusCode = 401;
      break;
    default:
      err.statusCode = err.statusCode || 500;
      console.log("ERROR", err);
  }

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    // errorStack: err.stack,
  });
};
