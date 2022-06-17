const express = require('express');

const morgan = require('morgan');

const tourRouter = require('./routes/TourRoutes');
const userRouter = require('./routes/UserRoutes');

const port = 8000;

const app = express();

//MIDDLEWEAR
app.use(morgan('dev')); //logging
app.use(express.json());

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

//START SERVER
app.listen(port, () => {
  console.log('App running ');
});
