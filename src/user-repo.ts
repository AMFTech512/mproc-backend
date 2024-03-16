import { DIContainer } from "./di";
import { makeSetClause } from "./util";

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
}

export async function getUser(container: DIContainer, userId: string) {
  const dbClient = container.postgresClient;

  const res = await dbClient.query("SELECT * FROM users WHERE id = $1", [
    userId,
  ]);
  const user = res.rows[0] as UserRow;
  return user;
}

export function insertUser(container: DIContainer, user: UserRow) {
  const dbClient = container.postgresClient;

  return dbClient.query(
    "INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)",
    [user.id, user.email, user.password_hash]
  );
}

export async function deleteUser(container: DIContainer, userId: string) {
  const dbClient = container.postgresClient;

  return dbClient.query("DELETE FROM users WHERE id = $1", [userId]);
}

export function makeUpdateUserQuery(user: Partial<UserRow>) {
  const [clause, values, nextIdx] = makeSetClause(user, { exclude: ["id"] });
  return {
    text: `UPDATE users SET ${clause} WHERE id = $${nextIdx}`,
    values: [...values, user.id],
  };
}

export async function updateUser(
  container: DIContainer,
  user: Partial<UserRow>
) {
  const dbClient = container.postgresClient;

  return dbClient.query(makeUpdateUserQuery(user));
}
