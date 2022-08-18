// const express = require('express');
// const {
//   getAllTours,
//   createTour,
//   getTour,
//   updateTour,
//   deleteTour,
//   checkID,
//   checkBody,
//   aliasTopTours,
//   getToursStats,
//   getMonthlyPlan,
// } = require('../controllers/TourController');

// const { protect, restrictTo } = require('../controllers/AuthController');

// const router = express.Router();

// router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
// router.route('/tour-stats').get(getToursStats);
// router.route('/monthly-plan/:year').get(getMonthlyPlan);

// router.route('/').get(protect, getAllTours).post(createTour);
// router
//   .route('/:id')
//   .get(getTour)
//   .patch(updateTour)
//   .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

// module.exports = router;
const express = require('express');
const tourController = require('../controllers/TourController');
const authController = require('../controllers/AuthController');

const router = express.Router();

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getToursStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
