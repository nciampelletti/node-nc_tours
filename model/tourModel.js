const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      maxlength: [40, 'A tour name must have less or equal then 40 charecters'],
      minlength: [10, 'A tour name must have more or equal then 10 charecters'],
      // validate: [validator.isAlpha, 'The name must contain only letters'],
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
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either easy, medium, or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'A tour rating must have less or equal then 5'],
      min: [1, 'A tour rating must have more or equal then 1'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //works only on NEW docs , not update
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below reqular price',
      }, //custom validator
    },
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
    startLocation: {
      //GeoJson
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
    quides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  {
    //displays virtuals fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//virtual fields definition
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

//QUERY MIDDLEWEARE - for all find we use reqular expressions
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  //use populate to joim main quiry with the references once -> Tours with Users (guide field)
  this.populate({
    path: 'quides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

tourSchema.post(/^find/, function (doc, next) {
  console.log(`query took: ${Date.now() - this.start} milliseconds`);

  next();
});

//AGREGATION MIDDLEWEAR
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
