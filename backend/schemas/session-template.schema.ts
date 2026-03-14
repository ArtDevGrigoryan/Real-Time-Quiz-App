import { z } from "zod";

export const questionSchema = z.object({
  id: z.string().min(1),

  text: z.string().min(1),

  options: z.array(z.string().min(1)).length(4),

  correct_index: z.number().int().min(0).max(3),
});

const quizScoringSchema = z.object({
  mode: z.literal("time_weighted"),
  base_points: z.number().int().positive(),
});

export const quizActivitySchema = z.object({
  id: z.string(),

  type: z.literal("quiz"),

  step: z.number().int().positive(),

  title: z.string(),

  timer_seconds: z.number().int().positive(),

  scoring: quizScoringSchema,

  show_leaderboard_after_each: z.boolean(),

  questions: z.array(questionSchema).min(1),
});

const puzzleScoringSchema = z.object({
  mode: z.literal("self_report"),

  points_per_correct: z.number().int().positive(),
});

export const puzzleActivitySchema = z.object({
  id: z.string(),

  type: z.literal("puzzle_assembly"),

  step: z.number().int().positive(),

  title: z.string(),

  instruction: z.string().min(1).optional(),

  timer_seconds: z.number().int().positive(),

  fragments_count: z.number().int().positive(),

  scoring: puzzleScoringSchema,
});

export const activitySchema = z.discriminatedUnion("type", [
  quizActivitySchema,
  puzzleActivitySchema,
]);

export const sessionTemplateSchema = z.object({
  session_template: z.object({
    name: z.string(),

    activities: z.array(activitySchema).min(1),
  }),
});
