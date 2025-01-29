import { ErrorRequestHandler } from "express";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message;
  let error = err;

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    error,
  });
};

export default globalErrorHandler;
