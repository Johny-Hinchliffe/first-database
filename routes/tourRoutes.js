const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();
// router.param('id', tourController.checkID);

router.use('/:tourId/reviews', reviewRouter);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours)
  .get(tourController.getAllTours);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  )
  .patch(tourController.updateTour);

router.route('/add-date/:id').patch(tourController.addDate);

//POST /tour/5c88fa8cf4afda39709c2970/reviews
//GET /tour/5c88fa8cf4afda39709c2970/reviews
//GET /tour/5c88fa8cf4afda39709c2970/reviews/1212jjhh4d9468fgh2

module.exports = router;
