const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
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
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image cover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //cant be created
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    //displays virtuals fields
    toJSON: { virtuals: true },
    toobject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

//model middlewear, pre runs before .save() and .create() (except .insertMany())
tourSchema.pre('save', function (next) {
  // "name": "The Whistler Lights 2",
  // "slug": "the-whistler-lights-2",
  this.slug = slugify(this.name, { lower: true });
  next();
});

/*
tourSchema.pre('save', function (next) {
  console.log('will save documents....');
  next();
});

//execur\ted after post save happens, we have a ready doc as result
tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});
*/

//QUERY MIDDLEWEARE - for all find we use reqular expressions
tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre('find', function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (doc, next) {
  console.log(`query took: ${Date.now() - this.start} milliseconds`);
  console.log(doc);
});

// tourSchema.pre('findOne', function (next) {
//   this.find({ secretTour: { $ne: true } });
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
