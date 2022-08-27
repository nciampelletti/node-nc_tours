const mongoose = require('mongoose');
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
    select: 'name -_id',
  });

  next();
});

module.exports = mongoose.model('Review', ReviewSchema);

//POST /tours/qe123sadasda3sadasdsdas/reviews
//GET /tours/qe123sadasda3sadasdsdas/reviews/12312asadasd12312213
//reviews is child of tours - nested route
