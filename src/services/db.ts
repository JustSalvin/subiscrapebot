import { type Db, MongoClient } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
	if (db) return db;

	if (!process.env.DB_URL) {
		throw new Error("DB_URL environment variable is not set.");
	}
	if (!process.env.DB_NAME) {
		throw new Error("DB_NAME environment variable is not set.");
	}

	client = new MongoClient(process.env.DB_URL);
	await client.connect();
	db = client.db(process.env.DB_NAME);

	return db;
}

export async function initDatabase(database: Db): Promise<void> {
	console.log("Running database initialization...");

	await database
		.collection("alerts")
		.createIndex({ query: 1 }, { unique: true });

	console.log("Database initialized.");
}
