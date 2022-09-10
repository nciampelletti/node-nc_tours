const { promisify } = require('util');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const { listeners } = require('../model/tourModel');
const sendEmail = require('../utils/emailHandler');
const crypto = require('crypto'); //buildin module

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  //remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // //TODO: remove
  // req.set('Access-Control-Allow-Origin', 'http://localhost:3000');

  console.log('WE ARE HERE!');

  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  createSendToken(user, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  //TODO: remove
  // req.set('Access-Control-Allow-Origin', 'http://localhost:3000');

  // console.log('WE ARE HERE!');

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
  createSendToken(user, 200, req, res);
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
  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //Get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  //generater random token
  const resetToken = user.createPasswordResetToken();
  //Important - VALIDATION OPTION ON SAVE - to prevent validation check for required fields
  await user.save({ validateBeforeSave: false });

  //send it back as an email
  //sendEmail;
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a request with your new passsword and confirm to: ${resetUrl}. If you didnt forget your fassword, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid 10 mins)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    //Important - VALIDATION OPTION ON SAVE - to prevent validation check for required fields
    await user.save({ validateBeforeSave: false });

    console.log(err);

    return next(
      new AppError('There was an error sending an email. Try again later', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //get user based on token
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    next(
      new AppError(
        'The user belonging to this token is no longer exists or token has expired',
        404
      )
    );
  }

  //if token is not expired, and there is a user, set new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  //update changedPasswordAt property for the user
  //this step done automatically in the model

  //Important - VALIDATION OPTION ON SAVE - to prevent validation check for required fields
  //in this case we want ot validate
  await user.save();

  //log the user in and send new JWT
  //id everything is ok send json token back to the client
  createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //Get user from the collection
  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return next(new AppError('The user doesnt exist', 404));
  }

  //check if posted password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  //if password is correct, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  //update changedPasswordAt property for the user
  //this step done automatically in the model

  //Important - VALIDATION OPTION ON SAVE - to prevent validation check for required fields
  //in this case we want ot validate
  //User.findByIdandUpdate will not work as intented1
  await user.save();

  //log the user in and send new JWT
  //id everything is ok send json token back to the client
  createSendToken(user, 200, req, res);
});
