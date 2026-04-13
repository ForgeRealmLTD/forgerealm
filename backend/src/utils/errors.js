class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const notFound = (req, res, next) => {
  next(new ApiError(404, 'Route not found'));
};

const errorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  // Only expose error details for known ApiError instances; generic message for unexpected 500s
  const message = err instanceof ApiError ? err.message : (status === 500 ? 'Internal server error' : err.message || 'Internal server error');
  res.status(status).json({ error: message });
};

module.exports = { ApiError, asyncHandler, notFound, errorHandler };