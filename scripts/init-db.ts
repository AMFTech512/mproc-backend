// This script is used to create all the databases and tables needed for the application to run.

import { initDb } from "../src/postgres";

await initDb();
