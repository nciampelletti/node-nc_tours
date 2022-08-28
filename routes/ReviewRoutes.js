const express = require('express');
const reviewController = require('../controllers/ReviewController');
const authController = require('../controllers/AuthController');

//in order to get access to tourId from above route
//we need to merge params
const router = express.Router({ mergeParams: true });

//POST /tours/qe123sadasda3sadasdsdas/reviews
//GET /tours/qe123sadasda3sadasdsdas/reviews/12312asadasd12312213

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(reviewController.deleteReview)
  .patch(reviewController.updateReview);

module.exports = router;
