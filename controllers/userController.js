const User = require('../models/userModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  console.log(newObj);
  return newObj;
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm)
    next(
      new AppError(
        'This route is not for password updates, please use /updateMyPassword',
        400
      )
    );
  // 2) filter unwanted fields
  const filteredBody = filterObj(req.body, 'name', 'email');
  // 3) update user document
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.correctPassword(req.body.password, user.password))) {
    return next(new AppError('Password is incorrect', 401));
  }
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/* 

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) Get the user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Current password is incorrect', 401));
  }

  // 3) if so, update
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // 4) log user in, send jwt
  createSendToken(user, 200, res);
});



*/

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

// Do Not use update password with this as the save middleware is not run
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
