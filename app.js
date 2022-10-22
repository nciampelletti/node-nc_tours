const express = require('express');
const morgan = require('morgan');
const path = require('path');

//security used middlewear
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const compression = require('compression');

const AppError = require('./utils/appError');
const tourRouter = require('./routes/TourRoutes');
const userRouter = require('./routes/UserRoutes');
const reviewRouter = require('./routes/ReviewRoutes');
const bookingRouter = require('./routes/BookingRoutes');
const globalErrorHandler = require('./controllers/ErrorController');

const app = express();

//NEW
//app.enable('trust proxy');
app.set('trust proxy', 1);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

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
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//Data sanitization against NoSQL query injections
app.use(mongoSanitize());

//Data sanitization against XSS attacks
//that will clean input from mellicious HTML
app.use(xss());

// 1) GLOBAL MIDDLEWARES
// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin *
// app.use(
//   cors({
//     origin: 'http://localhost:3000',
//     credentials: true,
//   })
// );

//GLOBAL MIDDLEWEAR
//Set security HTTP HEADERS
app.use(helmet()); //secure header

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

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

//compress text send to clients
app.use(compression());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

//ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`cant find ${req.originalUrl} on the server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
