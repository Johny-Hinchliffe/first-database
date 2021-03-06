const mongoose = require('mongoose');
const Tour = require('./tourModel');
const User = require('./userModel');

const AppError = require('../utilities/appError');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      minlength: [10, 'Please enter at least 10 characters'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// DOUBLE CHECK MULTIPLE REIEWS
//reviewSchema.index({ tour: -1, user: -1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  }).populate({
    path: 'tour',
    select: 'name',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        numRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].numRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post(/^findOneAnd/, function () {
  this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.rev = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.rev.constructor.calcAverageRatings(this.rev.tour);
});

reviewSchema.pre('save', async function (next) {
  const doc = await Tour.findById(this.tour);
  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }
});

// reviewSchema.pre('save', async function (next) {
//   const foundReview = await Review.find({
//     tour: this.tour,
//     user: this.user,
//   });
//
//   if (foundReview === undefined || foundReview === null) {
//     return next(new AppError('You can only post one review per tour', 500));
//   }
// });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
