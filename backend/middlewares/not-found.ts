import type { Request, Response, NextFunction } from "express";

export function notFoundHandler(
  _req: Request,
  _res: Response,
  next: NextFunction,
) {
  next({
    status: 404,
    message: "Route not found",
  });
}
