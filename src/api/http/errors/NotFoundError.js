class NotFoundError extends Error {
  constructor(message) {
    super(message);

    this.status = 404;
  }
}

class BadDataError extends Error {
  constructor(message) {
    super(message);

    this.status = 400;
  }
}

module.exports = { NotFoundError, BadDataError };
