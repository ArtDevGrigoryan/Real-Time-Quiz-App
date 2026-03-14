import path from "path";
import fs from "fs";
import { sessionTemplateSchema } from "../schemas/session-template.schema";

const templateFilePath = path.resolve("./session_template.json");
const raw = fs.readFileSync(templateFilePath, "utf-8");

const parsed = JSON.parse(raw);

export default sessionTemplateSchema.parse(parsed);
