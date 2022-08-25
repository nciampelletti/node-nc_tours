const express = require('express');
const morgan = require('morgan');
const path = require('path');

//security used middlewear
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const tourRouter = require('./routes/TourRoutes');
const userRouter = require('./routes/UserRoutes');
const globalErrorHandler = require('./controllers/ErrorController');

const app = express();

//GLOBAL MIDDLEWEAR
//Set security HTTP HEADERS
app.use(helmet()); //secure header

//development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //logging
}

//limit requests from the same API
const limiter = rateLimit({
  max: 100, //allowed 100 requests from the same IP per hour
  window: 1000 * 60 * 60,
  message: 'Too many requests from this IP. Please try again in an hour',
});
app.use('/api', limiter); //we apply only to api routes

//body parser, reading data from the body to req.body
app.use(express.json({ limit: '10kb' })); //body over 10kb would not be accepted

//Data sanitization against NoSQL query injections
app.use(mongoSanitize());

//Data sanitization against XSS attacks
//that will clean input from mellicious HTML
app.use(xss());

//prevent parameter polution, cleans query string
//../api/tours?sort=duration&sort=price
//by removing first duplicate parameter
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

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
