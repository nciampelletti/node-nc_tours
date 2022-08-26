const express = require('express');
const reviewController = require('../controllers/ReviewController');
const authController = require('../controllers/AuthController');

const router = express.Router();

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

module.exports = router;
