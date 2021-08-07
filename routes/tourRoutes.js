const express = require('express');
const tc = require('../controllers/tourController');

const router = express.Router();
// router.param('id', tc.checkID);

router.route('/').get(tc.getAllTours).post(tc.createTour);

router.route('/:id').get(tc.getTour).patch(tc.updateTour).delete(tc.deleteTour);

module.exports = router;
