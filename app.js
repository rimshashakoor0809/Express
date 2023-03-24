const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const errorHandler = require('./Utils/ErrorHandler');
const globalErrorHandler = require('./Controllers/errorController');

dotenv.config({ path: './config.env' });
const tourRouter = require('./Route/tourRoutes');
const userRouter = require('./Route/userRoutes');


const app = express();

// 1. MIDDLEWARES

//middleware for parsing body
app.use(express.json()); 
// Third-Party Middleware
// HTTP request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// 2. ROUTE MIDDLEWARE

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {

  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.status = 'Fail😥';
  // err.statusCode = 404;
  next(new errorHandler(`Can't find ${req.originalUrl} on this server!`,404));
})

// GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;



/*
app.get('/api/v1/tours', getAllTours);
app.post("/api/v1/tours", createNewTour);
app.get("/api/v1/tours/:id", getTourWithID);
app.patch("/api/v1/tours/:id", updateTour);
app.delete("/api/v1/tours/:id", deleteTour);
*/