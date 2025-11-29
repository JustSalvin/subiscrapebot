import { appendFileSync, existsSync, mkdirSync } from "node:fs";
import { createConsola, type LogObject } from "consola";
import { timestamp } from "../utils.js";

// ensure folder exists
if (!existsSync("./logs")) {
	mkdirSync("./logs");
}

function getLogFilePath() {
	const d = new Date();
	const pad = (n: number) => String(n).padStart(2, "0");
	const fileName = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.log`;
	return `./logs/${fileName}`;
}

function formatLog(logObj: LogObject, { pretty = false }) {
	const time = timestamp();
	const level = logObj.type.toUpperCase();

	const parts = logObj.args.map((a) =>
		typeof a === "object" ? JSON.stringify(a, null, pretty ? 2 : 0) : String(a),
	);

	const message = parts.join(" ");
	return `[${time}] [${level}] ${message}`;
}

export const logger = createConsola({
	reporters: [
		// console output
		{
			log(logObj) {
				console.log(formatLog(logObj, { pretty: true }));
			},
		},
		// file output
		{
			log(logObj) {
				appendFileSync(
					getLogFilePath(),
					`${formatLog(logObj, { pretty: true })}\n`,
				);
			},
		},
	],
});
