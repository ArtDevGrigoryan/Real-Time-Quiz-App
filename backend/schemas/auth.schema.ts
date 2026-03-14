import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().nonempty("Missing username"),
  password: z.string().nonempty("Missing password"),
});

export type ILoginDto = z.infer<typeof loginSchema>;
