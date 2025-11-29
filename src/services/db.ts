import { type Db, MongoClient } from "mongodb";
import { logger } from "./logger.js";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
	if (db) return db;
	throw new Error("Database not connected. Call connectToDb() first.");
}

export async function connectToDb(dbUrl: string): Promise<void> {
	if (client && db) return;

	client = new MongoClient(dbUrl);
	await client.connect();
	db = client.db();
}

export async function initDb(database: Db): Promise<void> {
	logger.info("Initializing database...");

	await database
		.collection("alerts")
		.createIndex({ query: 1 }, { unique: true });

	logger.success("Database initialized.");
}
