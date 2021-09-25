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

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined, use /signup instead',
  });
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
}; // factory.getOne(User);
exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);

// Do Not use update password with this as the save middleware is not run
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
