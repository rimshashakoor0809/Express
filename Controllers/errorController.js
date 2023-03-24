const ErrorHandler = require("../Utils/ErrorHandler");

const handleJWTError = () => new ErrorHandler('Invalid Token. Please login again😵', 401);
const handleJWTExpireError = () =>
  new ErrorHandler('Expired Token. Please login again😵', 401);

const handleCastErrorDB = err => {
  const message = `INVALID ${err.path}: ${err.value}`;
  return new ErrorHandler(message, 404);
};

const handleDuplicateFieldDB = (err) => {
  const value = err.errmsg.match(/(["'](\\?.)*?\1)/)[0];
  console.log(value);
  const message = `Duplicate field value: ${value}. Please use another one.`;
  return new ErrorHandler(message, 404);
};

const handleValidationErrorDB = err => {
  const errorMsgArray = Object.values(err.errors).map(val => val.message).join(' ');
  console.log(errorMsgArray);
  const message = `Invalid Input Data: ${errorMsgArray}`;
  return new ErrorHandler(message, 404);
};

const devError = (err, res) => {
   res.status(err.statusCode).json({
     status: err.status,
     error: err,
     message: err.message,
     stack: err.stack,
   });
    
}

const proError = (err, res) => {
// Operational: trusted Error: Send to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    
  }
  // Programming or some other unknown Error 
  else {
    console.error('ERROR💀', err)
    res.status(500).json({
      status: 'Error😥',
      message: 'Something Went Wrong. Try Again!',
    });
  }
};


module.exports = (err, req, res, next) => {
  err.statusCode = err.statuscode || 500;
  err.status = err.status || 'Error☠️';
  
  if (process.env.NODE_ENV === 'development') {
    devError(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldDB(error);
    if (error.name === 'ValidatorError') error = handleValidationErrorDB(error);
    proError(error, res);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpireError();
  }
};