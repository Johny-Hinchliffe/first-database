const dotenv = require('dotenv'); // and npm like prettier that ensures you follow certain rules
const mongoose = require('mongoose'); // extension on mongodb

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
  .then(() => console.log(`DB connection successful`));

const port = process.env.PORT;
app.listen(port, () => {
  // console.log(`App running on port ${port}...`);
});
