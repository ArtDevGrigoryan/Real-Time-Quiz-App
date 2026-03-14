export class HttpException extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundException extends HttpException {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

export class ConflictException extends HttpException {
  constructor(message = "Conflict") {
    super(message, 409);
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}
export class ForbiddenException extends HttpException {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}
export class BadRequestException extends HttpException {
  constructor(message = "Bad request") {
    super(message, 400);
  }
}
