const ErrorHander = require("./errorhandler.js");


const handler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Wrong Mongodb Id error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHander(message, 400);
  }
  // Validation Error
  if (err.name === 'ValidationError') {
    // Extract and format the validation errors
    const errors = Object.values(err.errors).map(e => e.message);
    err = new ErrorHander(errors.join(', '), 400);
  }
  // Duplicate key error
  if (err.code === 11000) {
    const message = err.message;
    err = new ErrorHander(message, 400);
  }


  console.log(err)
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
module.exports = handler