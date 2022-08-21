const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto'); //buildin module

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide user name'],
  },
  email: {
    type: String,
    require: [true, 'Please provide an email'],
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
    // match: [
    //   /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    //   'Please provide valid email',
    // ],
    unique: true,
  },
  photo: {
    type: String,
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'guide', 'lead-guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Please provide user password'],
    minLength: 6,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      //this is only works on CREATE new onjects and SAVE!! would not work on update
      validator: function (el) {
        return el === this.password;
      },
      message: 'Are not the same!!!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

UserSchema.pre(/^find/, async function (next) {
  //this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

UserSchema.pre('save', async function (next) {
  //only run this function if password was modified
  if (!this.isModified('password') || this.isNew) return next();

  //sometimes token is created faster (before) the changepasssword is updated
  //lets use little hack to minus 1 sec
  //that would insure the token is created after passwordChangedAt is updated
  this.passwordChangedAt = Date.now() - 1000;

  next();
});

UserSchema.pre('save', async function (next) {
  //only run this function if password was modified
  if (!this.isModified('password')) return next();

  //hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  //delete passwordconfirm field
  this.passwordConfirm = undefined;

  next();
});

UserSchema.methods.correctPassword = async function (
  candidatePassword,
  dbPassword
) {
  return await bcrypt.compare(candidatePassword, dbPassword);
};

UserSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changesTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000);
    return JWTTimeStamp < changesTimeStamp;
  }

  return false;
};

UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
