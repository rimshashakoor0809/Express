 const mongoose = require('mongoose');
const dotenv = require('dotenv');
const rejectionHandler = require('./Utils/RejectedPromise');

 // **************** HANDLING REJECTIONS *****************
process.on('unhandledRejection', (err) => rejectionHandler(err));
process.on('uncaughtException', (err) => rejectionHandler(err));


const app = require('./app');
dotenv.config({ path: './config.env' });
// console.log(app.get('env'));
// console.log(process.env);

const DB = process.env.DATABASE_REMOTE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((con) => console.log('DATABASE CONNECTION SUCCESSFUL😃'));

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`Server Activated at ${port}: Application has started💖`);
});




