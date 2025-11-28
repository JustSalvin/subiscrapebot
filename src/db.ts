import { MongoClient, Db } from "mongodb";

export class Database {
  static client: MongoClient;
  static db: Db;

  static async getDb() {
    if (Database.db) return Database.db;

    if (!process.env.DB_URL) {
      throw new Error("DB_URL environment variable is not set.");
    }
    if (!process.env.DB_NAME) {
      throw new Error("DB_NAME environment variable is not set.");
    }

    // Connessione
    Database.client = new MongoClient(process.env.DB_URL);
    await Database.client.connect();
    Database.db = Database.client.db(process.env.DB_NAME);

    return Database.db;
  }

  static async init(db: Db) {
    console.log("Running database initialization...");

    await db.collection("alerts").createIndex({ query: 1 }, { unique: true })

    console.log("Database initialized.");
  }
}
