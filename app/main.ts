import fs from "fs";
import sqlite3 from "sqlite3";
import { fetchSubito } from "./subitoApi";

const db = new sqlite3.Database("database.sqlite");

const data = await fetchSubito({
  query: "laptop",
})

fs.writeFileSync("output.json", JSON.stringify(data, null, 2));
