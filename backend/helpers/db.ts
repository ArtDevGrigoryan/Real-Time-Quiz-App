import { PrismaClient } from "@prisma/client";

class Database {
  private static instance: PrismaClient;

  static async connect() {
    if (!Database.instance) {
      Database.instance = new PrismaClient();

      await Database.instance.$connect();
      console.log("Database connected");
    }

    return Database.instance;
  }

  static get client() {
    if (!Database.instance) {
      throw new Error("Database not connected. Call Database.connect() first.");
    }

    return Database.instance;
  }
}

export default Database;
