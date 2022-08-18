const { promisify } = require('util');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const { listeners } = require('../model/tourModel');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(user._id);

  res.status(201).json({
    status: 'success',
    token,
    data: { user },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { password, email } = req.body;

  //check whethe email and passwords exist
  if (!password || !email) {
    next(new AppError('Please provide email and password', 400));
  }

  //check whether user exists and password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    next(
      new AppError(
        'Please provide email and passwordIncorrect email or password',
        401
      )
    );
  }

  //id everything is ok send json token back to the client
  const token = await signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //Get token and check whther it is there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    next(
      new AppError('You are not logged in. Please login to get access', 401)
    );
  }

  //verify token
  const { id: userID, iat: JWTtimeStamp } = jwt.verify(
    token,
    process.env.JWT_SECRET
  );
  //attach the user to the job routes
  console.log(userID);

  //check if user exists
  const freshUser = await User.findById(userID);

  if (!freshUser) {
    next(
      new AppError('The user belonging to this token is no longer exists', 401)
    );
  }

  //check if use changed password after JWT was issued
  if (freshUser.changedPasswordAfter(JWTtimeStamp)) {
    //password was changed
    next(
      new AppError(
        'User recently has chnaged the password. Please login again.',
        401
      )
    );
  }

  //grant access to the protected route
  //req.user = freshUser;
  next();
});
