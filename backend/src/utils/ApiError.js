/**
 * An error that carries an HTTP status code, so controllers can simply
 * `throw new ApiError(404, "Request not found")` and the central error
 * handler turns it into a clean JSON response.
 */
class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

/** Wraps async route handlers so thrown errors reach the error middleware. */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { ApiError, asyncHandler };
