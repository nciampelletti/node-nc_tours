const mongoose = require('mongoose');

//SAFETY NET
//catches all uncaught exceptions
process.on('uncaughtException', (err) => {
  process.exit(1);
});

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');
const port = process.env.PORT || 8000;

//evironment variables
const DB = process.env.DATABASE;

mongoose
  .connect(DB, {
    //.connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('DB connection success');
  });

//START SERVER
const server = app.listen(port, () => {
  console.log('App running ');
});

//SAFETY NET
//handling promiss rejections anywhere in the app
process.on('unhandledRejections', (err) => {
  console.log(err.name, err.message);
  console.log('unhandled Rejection. Shutting Down');
  server.close(() => {
    process.exit(1);
  });
});
