class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // super calls parent constructor
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor); // When a new obj is created and the constructor function is called, that fuction call is not in the stack trace and polute it
  }
}

module.exports = AppError;
