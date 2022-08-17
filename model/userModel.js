const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
  password: {
    type: String,
    required: [true, 'Please provide user password'],
    minLength: 6,
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

module.exports = mongoose.model('User', UserSchema);
