import { createConnection } from "typeorm";
import path from "path";

import { environment } from "./environment";

export async function connect() {
  await createConnection({
    type: "postgres",
    port: Number(environment.DB_PORT),
    username: "postgres",
    password: "123456",
    database: environment.DB_DATABASE,
    entities: [path.join(__dirname, "../entity/**/**.ts")],
    synchronize: true,
  });
  console.log("Database Running");
}
