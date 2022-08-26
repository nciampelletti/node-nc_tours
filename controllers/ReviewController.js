const Review = require('../model/reviewModel');
// const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find();

  /* SEND RESPONSE */
  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews },
  });
});

exports.createReview = catchAsync(async (req, res) => {
  const review = await Review.create(req.body);

  /* SEND RESPONSE */
  res.status(201).json({
    status: 'success',
    data: { review },
  });
});
