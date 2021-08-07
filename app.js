// const fs = require('fs'); // put file system into variable
const express = require('express'); // put express into variable
const morgan = require('morgan'); // HTTP request logger middleware for Node. js. It simplifies the process of logging requests to your application
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express(); // put express() into variable
//||\\ 1) Middleware
// console.log(process.env.NODE_ENV)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json()); // middleware is a function that can modify the incoming request data (stands between req and res)
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  // console.log('Hello from the middleware!');
  next();
});

app.use((req, res, next) => {
  // console.log('Checking date')
  req.requestTime = new Date().toUTCString();
  next();
});

//||\\ 2) Route Handlers
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

module.exports = app;
