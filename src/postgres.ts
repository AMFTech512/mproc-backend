import { Client } from "pg";
import Joi from "joi";
import _ from "lodash";
import path from "path";

interface PostgresConfig {
  database: string;
  host: string;
  port: number;
  username: string;
  password: string;
  databaseUrl: string;
}

export function getPostgresConfig(): PostgresConfig {
  return Joi.attempt(
    // If DATABASE_URL is set, use it, otherwise use the other environment variables
    process.env.DATABASE_URL
      ? { databaseUrl: process.env.DATABASE_URL }
      : {
          database: process.env.POSTGRES_DATABASE,
          host: process.env.POSTGRES_HOST,
          port: process.env.POSTGRES_PORT,
          username: process.env.POSTGRES_USERNAME,
          password: process.env.POSTGRES_PASSWORD,
        },
    Joi.alternatives().try(
      Joi.object({
        database: Joi.string().required(),
        host: Joi.string().required(),
        port: Joi.number().required(),
        username: Joi.string().required(),
        password: Joi.string().required(),
      }),
      Joi.object({
        databaseUrl: Joi.string().required(),
      })
    )
  );
}

export async function initPostgresClient(config?: Partial<PostgresConfig>) {
  const _config: PostgresConfig = _.defaults(config || {}, getPostgresConfig());

  const client = _config.databaseUrl
    ? new Client(_config.databaseUrl)
    : new Client({
        database: _config.database,
        host: _config.host,
        port: _config.port,
        user: _config.username,
        password: _config.password,
      });

  await client.connect();

  console.log(
    "Connected to postgres db",
    _config.database,
    "at",
    _config.host,
    "on port",
    _config.port,
    "as user",
    _config.username
  );

  return client;
}

const TABLES_SQL_PATH = path.resolve(
  import.meta.dir,
  "../db/def/init_tables.sql"
);

export async function initDb(dbName?: string) {
  console.log(`Creating database ${dbName} and tables...`);
  // create the database if it does not exist
  await createDatabaseIfNotExists(dbName);

  // connect to the database
  const pgClient = await initPostgresClient({ database: dbName });

  // create the tables
  await createTables(pgClient);

  console.log("Database and tables created successfully.");

  pgClient.end();
}

export async function dropDb(dbName?: string) {
  console.log(`Dropping database ${dbName}...`);
  // Connect to the default database
  const pgClient = await initPostgresClient({ database: "postgres" });

  // Get the database name
  const _dbName = dbName || getPostgresConfig().database;

  try {
    // Drop the database
    const dropDbQuery = `DROP DATABASE IF EXISTS "${_dbName}"`;
    await pgClient.query(dropDbQuery);
    console.log(`Database ${_dbName} dropped successfully.`);
  } catch (err) {
    console.error("Error dropping database:", err);
  } finally {
    await pgClient.end();
  }
}

export async function createTables(pgClient: Client) {
  console.log("Creating tables...");
  // read the file that contains the create tables query
  const createTablesQuery = await Bun.file(TABLES_SQL_PATH).text();

  // execute the query
  await pgClient.query(createTablesQuery);

  console.log("Tables created successfully.");
}

async function createDatabaseIfNotExists(dbName?: string, pgClient?: Client) {
  // Connect to the default database
  const _pgClient =
    pgClient || (await initPostgresClient({ database: "postgres" }));

  // Get the database name
  const _dbName = dbName || getPostgresConfig().database;

  try {
    // Check if the database exists
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = '${_dbName}'`;
    const dbExistsResult = await _pgClient.query(checkDbQuery);

    if (dbExistsResult.rowCount === 0) {
      // Database does not exist, create it
      const createDbQuery = `CREATE DATABASE "${_dbName}"`;
      await _pgClient.query(createDbQuery);
      console.log(`Database ${_dbName} created successfully.`);
    } else {
      console.log(`Database ${_dbName} already exists.`);
    }
  } catch (err) {
    console.error("Error creating database:", err);
  } finally {
    await _pgClient.end();
  }
}
