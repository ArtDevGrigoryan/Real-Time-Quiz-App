import jwt from "jsonwebtoken";
import env from "./env";

export function createAccessToken<T extends Object>(payload: T) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "15m",
  });
}

export function createRefreshToken<T extends Object>(payload: T) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
}

export function createTokens<T extends Object>(payload: T) {
  return {
    accessToken: createAccessToken(payload),
    refreshToken: createRefreshToken(payload),
  };
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

export function decode(token: string) {
  return jwt.decode(token);
}
