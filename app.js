const express = require('express');
const morgan = require('morgan');
const path = require('path');

const tourRouter = require('./routes/TourRoutes');
const userRouter = require('./routes/UserRoutes');

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
  console.log('hello from the middleware');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();

  next();
});

//ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
