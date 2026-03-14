import { Prisma } from "@prisma/client";

export type SessionWithParticipants = Prisma.SessionGetPayload<{
  include: {
    participants: true;
  };
}>;
