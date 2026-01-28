import type { NextFunction, Request, RequestHandler, Response } from "express";
import ErrorResponse from "./common/error-response.js";
import AppError from "./errors/app-error.js";

const tryCatch = (handler: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        ErrorResponse.message = error.explanation;
        ErrorResponse.error = { explanation: error.explanation };
        ErrorResponse.data = {};
        return res.status(error.statusCode).json(ErrorResponse);
      }
      // Unknown/generic error
      const err =
        error instanceof Error ? error : new Error("Internal Server Error");
      ErrorResponse.message = "Internal Server Error";
      ErrorResponse.error = { message: err.message };
      ErrorResponse.data = {};
      return res.status(500).json(ErrorResponse);
    }
  };
};

export default tryCatch;
