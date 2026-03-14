import { ActivityType } from "@prisma/client";
import db from "../helpers/db";
import loadedData from "../helpers/load-session-template-json";

export default async function insertSessionTemplate(
  templateName: string,
  roomCode: string,
  maxParticipants: number,
) {
  const data = loadedData.session_template;

  const result = await db.client.$transaction(async (prisma) => {
    const sessionTemplate = await prisma.sessionTemplate.create({
      data: { name: templateName },
    });

    const session = await prisma.session.create({
      data: {
        templateId: sessionTemplate.id,
        roomCode,
        maxParticipants,
        status: "WAITING",
      },
    });

    for (const act of data.activities) {
      const activity = await prisma.activity.create({
        data: {
          templateId: sessionTemplate.id,
          type:
            act.type.toLowerCase() === "quiz"
              ? ActivityType.QUIZ
              : ActivityType.PUZZLE_ASSEMBLY,
          title: act.title,
          order: act.step,
          description:
            act.type === "puzzle_assembly" ? act.instruction || null : null,
        },
      });

      if (act.type === "quiz") {
        for (const [qIndex, q] of act.questions.entries()) {
          const question = await prisma.question.create({
            data: {
              activityId: activity.id,
              text: q.text,
              correctIdx: q.correct_index,
              timeLimit: act.timer_seconds,
              order: qIndex + 1,
            },
          });

          if (q.options?.length) {
            const optionsData = q.options.map((optText) => ({
              questionId: question.id,
              text: optText,
            }));
            await prisma.option.createMany({ data: optionsData });
          }
        }
      }
    }

    return session;
  });

  return result;
}
