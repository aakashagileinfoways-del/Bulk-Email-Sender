import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/http-error.js";

export const errorHandler = (
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void => {
  if (error instanceof ZodError) {
    response.status(400).json({
      error: error.issues.map((issue) => issue.message).join("; "),
    });
    return;
  }
  if (error instanceof HttpError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }
  response.status(500).json({ error: "Request failed." });
};

export const notFoundHandler = (_request: Request, response: Response): void => {
  response.status(404).json({ error: "Route not found" });
};
