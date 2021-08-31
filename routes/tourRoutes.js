const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const router = express.Router();
// router.param('id', tourController.checkID);

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
  .delete(tourController.deleteTour)
  .patch(tourController.updateTour);

router.route('/add-date/:id').patch(tourController.addDate);
module.exports = router;
