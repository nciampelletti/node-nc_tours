const express = require('express');
const tourController = require('../controllers/TourController');
const authController = require('../controllers/AuthController');

//routes merging - for nested routes
const reviewRouter = require('./ReviewRoutes');

const router = express.Router();

//POST /tours/qe123sadasda3sadasdsdas/reviews
//GET /tours/qe123sadasda3sadasdsdas/reviews/12312asadasd12312213
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getToursStats);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

//calculate the distance from cirtain point to the all tours in our collection
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

//tours-distance?distance=233&center=-40,45&unit=km
//tours-distance/233/center/-40,45/unit/km
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

router.route('/:slug').get(tourController.getTour);

module.exports = router;
