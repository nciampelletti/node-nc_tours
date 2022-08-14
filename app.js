const express = require('express');
const morgan = require('morgan');
const path = require('path');

const AppError = require('./utils/appError');
const tourRouter = require('./routes/TourRoutes');
const userRouter = require('./routes/UserRoutes');
const globalErrorHandler = require('./controllers/ErrorController');

const app = express();

//MIDDLEWEAR
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //logging
}

app.use(express.json());

//static files - html, images
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public/img'));
// app.use(express.static(__dirname + '/public/img/tours'));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

//ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`cant find ${req.originalUrl} on the server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
