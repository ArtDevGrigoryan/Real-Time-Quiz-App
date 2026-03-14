export interface IEnv {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  NODE_ENV: string;
  DEFAULT_SCORE_PUZZLE_ASSEMBLY: number;
  DEFAULT_DURATION_PUZZLE_ASSEMBLY: number;
}
