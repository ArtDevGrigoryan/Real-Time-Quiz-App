import type { Request, Response } from "express";
import { sendSuccess } from "../helpers/api-response";
import authService from "../services/auth.service";
import env from "../helpers/env";
import { UnauthorizedException } from "../helpers/errors";

class AuthController {
  async login(req: Request, res: Response) {
    const { accessToken, refreshToken } = await authService.login(req.body);

    res.cookie("refresh-token", refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, { accessToken }, "Login successful");
  }

  async refreshToken(req: Request, res: Response) {
    const refreshToken = req.cookies["refresh-token"];
    if (!refreshToken) throw new UnauthorizedException();

    const { accessToken, refreshToken: newRefresh } =
      await authService.refreshToken(refreshToken);

    res.cookie("refresh-token", newRefresh, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, { accessToken });
  }
}

export default new AuthController();
