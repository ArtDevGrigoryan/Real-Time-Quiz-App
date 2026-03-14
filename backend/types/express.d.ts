import express from "express";
import { IUser } from "./user.types";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      validated?: { body?: any; query?: any; params?: any };
    }
  }
}
