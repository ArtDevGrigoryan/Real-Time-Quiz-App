import {z} from "zod";

export const addSessionSchema = z.object({
    maxParticipants: z.coerce.number().int(),
})