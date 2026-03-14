import type { IEnv } from "../../types/env.types";

export default function envVariableValidation(env: NodeJS.ProcessEnv): IEnv {
  const requiredVariables = [
    "PORT",
    "DATABASE_URL",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "NODE_ENV",
    "DEFAULT_SCORE_PUZZLE_ASSEMBLY",
  ];
  const missingVariables = requiredVariables.filter(
    (variable) => !env[variable],
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(", ")}`,
    );
  }
  return {
    PORT: Number(process.env.PORT),
    DATABASE_URL: process.env.DATABASE_URL as string,
    JWT_SECRET: process.env.JWT_SECRET as string,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
    NODE_ENV: process.env.NODE_ENV as string,
    DEFAULT_SCORE_PUZZLE_ASSEMBLY: Number(
      process.env.DEFAULT_SCORE_PUZZLE_ASSEMBLY,
    ),
    DEFAULT_DURATION_PUZZLE_ASSEMBLY: Number(
      process.env.DEFAULT_DURATION_PUZZLE_ASSEMBLY,
    ),
  };
}
