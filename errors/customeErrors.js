class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.status = "fail";
    this.statusCode = 404;
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.status = "fail";
    this.statusCode = 401;
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.status = "fail";
    this.statusCode = 403;
  }
}

module.exports = {
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
};
