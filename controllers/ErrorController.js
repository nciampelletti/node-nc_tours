const AppError = require('../utils/appError');

const handleJWTExpiredError = (err) => {
  return new AppError('Expired token. Please login again', 401);
};

const handleJWTError = (err) => {
  return new AppError('Invalid token. Please login again', 401);
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;

  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
  const message = `Duplicate field value ${value[0]}. Please use another value.`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((error) => {
    return error.message;
  });
  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

const sendErrorProd = (err, res) => {
  //oOperational, trusted error: send message to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    //Programming or other uknown error: dont leak error details
  } else {
    //1) log error
    // console.log('ERROR !!!!', err);

    //2) Sned generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    //error handler for cast error
    if (error.name === 'CastError') {
      error = handleCastErrorDB(err);
    }

    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(err);
    }

    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(err);
    }

    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError(err);
    }

    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError(err);
    }

    sendErrorProd(error, res);
  }
};
