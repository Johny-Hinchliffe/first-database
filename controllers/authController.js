const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signup = catchAsync(async (req, res, next) => {
  // const newUser = await User.create(req.body);
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // Check if email and pass exist in email
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  //user exists & password correctness
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // if everything is ok, send tokem
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get the jwt and chekc if it exists
  let token;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer')) token = auth.split(' ')[1];
  if (!token)
    next(
      new AppError('You are not logged in. Please log in to get access', 401)
    );
  // 2) Verify the jwt
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3) Check if users still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) next(new AppError('The user no longer exists', 401));
  // 4) Check if user has changed pass after jwt
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401)
    );
  }
  // Grant access to Protected routes
  req.user = currentUser;
  next();
})
