const dotenv = require('dotenv'); // and npm like prettier that ensures you follow certain rules
const mongoose = require('mongoose'); // extension on mongodb

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception, Shutting down.');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`DB connection successful`)); //.catch(err => console.log('ERROR'))

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  // console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection, Shutting down.');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
