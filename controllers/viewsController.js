const Tour = require('../models/tourModel');
const catchAsync = require('../utilities/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  //1) Get tour data
  const tours = await Tour.find();

  //2) build template
  //3) render template from step 1
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = (req, res, next) => {
  res.status(200).render('tour', {
    title: 'The Forest Hiker Tour',
  });
};
