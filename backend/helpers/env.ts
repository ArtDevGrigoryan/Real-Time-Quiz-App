import dotenv from "dotenv";
import path from "node:path";
import validateEnvVariables from "./utilities/env-vars-validation";

const envPath = path.resolve("./.env");

dotenv.config({ path: envPath });

export default validateEnvVariables(process.env);
