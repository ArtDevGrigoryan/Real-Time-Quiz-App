import db from "../helpers/db";

class QuestionService {
  async findById(id: string) {
    return await db.client.question.findUnique({
      where: {
        id,
      },
      include: {
        options: true,
      },
    });
  }
}

export default new QuestionService();
