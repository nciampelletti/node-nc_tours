class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    //we want to preserve stack trace from original error object
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
