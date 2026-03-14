import { z } from "zod";

export const joinSchema = z.object({
  roomCode: z.string().length(6),
  name: z.string().nonempty(),
});

export type IJoinDto = z.infer<typeof joinSchema>;

export const answerSchema = z.union([
  z.object({
    questionId: z.string().nonempty(),
    selectedIdx: z.coerce.number().int(),
  }),
  z.object({
    activityId: z.string().nonempty(),
    correctCount: z.coerce.number().int(),
  }),
]);

export type IAnswerDto = z.infer<typeof answerSchema>;
