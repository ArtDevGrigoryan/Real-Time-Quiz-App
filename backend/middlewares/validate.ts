import type { NextFunction, Request, Response } from "express";
import { IOptions, ISchemas, ValidationSources } from "../types/api.types";

export default (schemas: ISchemas, options?: IOptions) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const validationSources: ValidationSources[] = [
        "body",
        "query",
        "params",
      ];

      req.validated = req.validated || { body: {}, query: {}, params: {} };
      validationSources.forEach((source) => {
        const schema = schemas[source];
        if (!schema || !req.validated) return;

        if (options?.defaults) {
          req.validated[source] = schema.parse(req[source]);
        } else {
          schema.parse(req[source]);
        }
      });
      next();
    } catch (err) {
      next(err);
    }
  };
