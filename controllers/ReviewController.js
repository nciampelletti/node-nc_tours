const Review = require('../model/reviewModel');
// const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

exports.getAllReviews = catchAsync(async (req, res) => {
  let filter;

  //allow nested routes
  if (req.params.tourId) {
    //if no tour specified in the body, take tourid from query string
    filter = { tour: req.params.tourId };
  }

  const reviews = await Review.find(filter);

  /* SEND RESPONSE */
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews },
  });
});

exports.setTourUserIds = (req, res, next) => {
  //allow nested routes
  if (!req.body.tour) {
    //if no tour specified in the body, take tourid from query string
    req.body.tour = req.params.tourId;
  }

  if (!req.body.user) {
    //if no user specified in the body, take tourid from query string
    req.body.user = req.user.id; //we get user from protect middlewear
  }

  next();
};

exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
