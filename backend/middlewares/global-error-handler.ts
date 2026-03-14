import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { sendError } from "../helpers/api-response";
import { HttpException } from "../helpers/errors";

export default function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let message = "Something went wrong";
  let status = 500;
  let fields: Record<string, string[]> | undefined;
  if (err instanceof HttpException) {
    message = err.message;
    status = err.statusCode;
  } else if (err instanceof ZodError) {
    status = 400;
    message = "Validation error";
    fields = err.flatten().fieldErrors;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        status = 409;
        message = "Unique constraint failed";
        break;

      case "P2025":
        status = 404;
        message = "Record not found";
        break;

      default:
        status = 400;
        message = err.message;
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    status = 400;
    message = "Database validation error";
  } else if (err instanceof Error) {
    message = err.message;
  }

  return sendError(
    res,
    message,
    status,
    fields,
    process.env.NODE_ENV === "development" ? err.stack : undefined,
  );
}
