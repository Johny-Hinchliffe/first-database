const express = require('express');
const tc = require('../controllers/tourController');

const router = express.Router();
// router.param('id', tc.checkID);

router.route('/tour-stats').get(tc.getTourStats);
router.route('/monthly-plan/:year').get(tc.getMonthlyPlan);

router.route('/top-5-cheap').get(tc.aliasTopTours).get(tc.getAllTours);

router.route('/').get(tc.getAllTours).post(tc.createTour);

router.route('/:id').get(tc.getTour).delete(tc.deleteTour).patch(tc.updateTour);

router.route('/add-date/:id').patch(tc.addDate);
module.exports = router;
