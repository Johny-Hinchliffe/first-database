const mongoose = require('mongoose'); // extension on mongodb
const slugify = require('slugify');
const validator = require('validator');
// Schema is a blueprint where you can set the schema data type etc
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'The tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal to 40 characters'],
      minlength: [10, 'A tour name must have more or equal to 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only include letters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'The tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'The tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'The tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty must be set to easy, medium or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'The tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc or NEW doc creation
          return val <= this.price;
        },
        message: `The discount price ({VALUE}) must be below the regular price`,
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'The tour must have a desciption'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'The tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
  }, // Schema definition, no name
  {
    // Object for the options (each time data is outputted at JSON and OBject it is there (true))
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual Properties (add a new key value pair that isn't stored in the database to save download speeds)
// can not use in a query as it isn't in the database
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
// PRE Document middleware: runs before the .save() and .create() but not inserMany()
// 'this' will point to the document not the query
// in save() middleware <em>this<em> points to the currently processed (saved) document
// pre save hook)
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', (next) => {
//   console.log('Will save document...');
//   next();
// });

// // POST Document middleware:
// tourSchema.post('save', (doc, next) => {
//   console.log(doc);
//   next();
// });

// QUERY Middleware ('find') << hook
// .pre() activates before any other middleware

// 'this' will point at query not document
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

// post() activates after hence post
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  // console.log(docs);
  next();
});

// AGGREGATION middleware allows to add hooks before or after agg happens
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

// validator js
