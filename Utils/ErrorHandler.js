class ErrorHandler extends Error{

  constructor(message, status_code) {
    super(message);
    this.status_code = status_code;
    this.status = `${status_code}`.startsWith('4') ? 'Fail😥' : 'Error💀';
    this.isOperation = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = ErrorHandler;