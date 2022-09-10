const mongoose = require('mongoose');
const Tour = require('../model/tourModel');

const ReviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review can not be empty'],
    },
    rating: {
      type: Number,
      max: [5, 'A  rating must have less or equal then 5'],
      min: [1, 'A  rating must have more or equal then 1'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belong to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a user'],
    },
  },
  {
    //displays virtuals fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//create campound index on Review to prevent multiple reviews
//Tour can only have 1 review per user
ReviewSchema.index({ tour: 1, user: 1 }, { unique: true });

ReviewSchema.pre(/^find/, function (next) {
  //use populate to joim main quiry with the references once -> Tours with Users (guide field)
  // this

  // this.populate({
  //   path: 'user',
  //   select: 'name -_id',
  // }).populate({
  //   path: 'tour',
  //   select: 'name photo',
  // });

  this.populate({
    path: 'user',
    select: 'name photo -_id',
  });

  next();
});

ReviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

//only for newly CREATED docs
ReviewSchema.post('save', function () {
  //this points to current review
  //this.constructor points to the Review model
  this.constructor.calcAverageRatings(this.tour);
});

//findOneAndUpdate
//findOneAndDelete
ReviewSchema.pre(/^findOneAnd/, async function (next) {
  //this keyword is the current query here, so we need it executed
  this.doc = await this.findOne();
  next();
});

ReviewSchema.post(/^findOneAnd/, async function () {
  //await this.find() does NOT work here, query has already executed
  await this.doc.constructor.calcAverageRatings(this.doc.tour);
});

module.exports = mongoose.model('Review', ReviewSchema);
