import { NextFunction, Response, Request } from "express";
import { NotFoundException, UnauthorizedException } from "../helpers/errors";
import { verifyAccessToken, verifyRefreshToken } from "../helpers/jwt";
import db from "../helpers/db";
import { IUser } from "../types/user.types";
import { ITokenPayload } from "../types/api.types";

async function getUser(id: string): Promise<IUser> {
  const user = await db.client.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new NotFoundException("User not found");
  }

  return user;
}

export default async function isAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { authorization: token } = req.headers;
    if (!token) {
      throw new UnauthorizedException("Authorization header missing");
    }
    const payload = verifyAccessToken(token) as ITokenPayload;
    const user = await getUser(payload.id);
    req.user = user;
    return next();
  } catch (err) {
    throw new UnauthorizedException();
  }
}
