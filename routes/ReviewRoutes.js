const express = require('express');
const reviewController = require('../controllers/ReviewController');
const authController = require('../controllers/AuthController');

//in order to get access to tourId from above route
//we need to merge params
const router = express.Router({ mergeParams: true });

//POST /tours/qe123sadasda3sadasdsdas/reviews
//GET /tours/qe123sadasda3sadasdsdas/reviews/12312asadasd12312213

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  );

module.exports = router;
