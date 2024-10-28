class ApiError extends Error {
  constructor(
    statusCode,
    message = "Server side Problem",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;
  }
}

module.exports = { ApiError };
