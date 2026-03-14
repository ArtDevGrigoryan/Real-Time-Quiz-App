import type { Response } from "express";

export const sendSuccess = (
  res: Response,
  data: any,
  message: string = "Success",
  status: number = 200,
) =>
  res.status(status).send({
    success: true,
    payload: data,
    message,
  });

export const sendError = (
  res: Response,
  message: string,
  status: number = 500,
  fields?: Record<string, string[]>,
  stack?: string,
) =>
  res.status(status).send({
    success: false,
    error: {
      message,
      fields,
      stack,
    },
  });
