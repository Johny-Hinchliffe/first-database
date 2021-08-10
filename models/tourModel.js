const mongoose = require('mongoose'); // extension on mongodb
const slugify = require('slugify');
// Schema is a blueprint where you can set the schema data type etc
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'The tour must have a name'],
      unique: true,
      trim: true,
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
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'The tour must have a price'],
    },
    priceDiscount: Number,
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
