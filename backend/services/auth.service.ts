import { ILoginDto } from "../schemas/auth.schema";
import db from "../helpers/db";
import { BadRequestException, NotFoundException } from "../helpers/errors";
import { compare, hash } from "../helpers/password";
import { createTokens, decode, verifyRefreshToken } from "../helpers/jwt";
import type { ITokenPayload } from "../types/api.types";
import { IRefreshTokenDto } from "../types/user.types";

class AuthService {
  async login(data: ILoginDto) {
    const found = await db.client.user.findUnique({
      where: {
        username: data.username,
      },
    });
    if (!found) {
      throw new BadRequestException("Invalid username or password");
    }
    const isValid = await compare(data.password, found.password);
    if (!isValid) {
      throw new BadRequestException("Invalid username or password");
    }
    const auth = createTokens({
      id: found.id,
      role: found.role,
    });
    const hashedRefreshToken = await hash(auth.refreshToken);
    await db.client.user.update({
      where: { id: found.id },
      data: { refresh_token: hashedRefreshToken },
    });
    return auth;
  }
  async refreshToken(token: string) {
    const payload = verifyRefreshToken(token) as ITokenPayload;
    const user = await db.client.user.findUnique({
      where: {
        id: payload.id,
      },
    });
    if (!user) {
      throw new NotFoundException();
    }
    const isValid = await compare(token, user.refresh_token || "");
    if (!isValid) {
      throw new BadRequestException("Invalid credintals");
    }
    const auth = createTokens({ id: user.id, role: user.role });
    const hashedRefreshToken = await hash(auth.refreshToken);
    await db.client.user.update({
      where: {
        id: user.id,
      },
      data: {
        refresh_token: hashedRefreshToken,
      },
    });
    return auth;
  }
}

export default new AuthService();
