const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'A booking must belong to a tour'],
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A booking must belong to a user'],
  },
  price: {
    type: Number,
    required: [true, 'A booking must have a price'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: false,
  },
});

bookingSchema.pre(/^find/, function (req, res, next) {
  //use populate to joim main quiry with the references once -> Tours with Users (guide field)
  this.populate('user').populate({ path: 'tour', select: 'name' });

  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
