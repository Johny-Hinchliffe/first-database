const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'You must enter a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'You must enter an email'],
    trim: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Invalid email'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'You must enter a password'],
    minlength: [8, 'A password must have more than 8 characters'],
    select: false,
  },
  passwordChangedAt: Date,
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        return this.password === el;
      },
      message: 'Passwords are not the same',
    },
  },
});

userSchema.pre('save', async function (next) {
  // Checks if password was modified
  if (!this.isModified('password')) return next();
  // Hashes the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  // Deletes the password confirm field in db
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (inputPass, userPass) {
  return await bcrypt.compare(inputPass, userPass);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
