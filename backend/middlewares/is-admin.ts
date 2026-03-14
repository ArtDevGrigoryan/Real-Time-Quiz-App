import { Request, Response, NextFunction } from "express";
import { ForbiddenException } from "../helpers/errors";

export default function isAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.user?.role != "ADMIN") {
    throw new ForbiddenException();
  }
  next();
}
