import { DIContainer } from "./di";
import { makeSetClause } from "./util";

interface User {
  id: string;
  username: string;
}

export async function getUser(container: DIContainer, userId: string) {
  const dbClient = container.postgresClient;

  const res = await dbClient.query("SELECT * FROM users WHERE id = $1", [
    userId,
  ]);
  const user = res.rows[0] as User;
  return user;
}

export function insertUser(container: DIContainer, user: User) {
  const dbClient = container.postgresClient;

  return dbClient.query("INSERT INTO users (id, username) VALUES ($1, $2)", [
    user.id,
    user.username,
  ]);
}

export async function deleteUser(container: DIContainer, userId: string) {
  const dbClient = container.postgresClient;

  return dbClient.query("DELETE FROM users WHERE id = $1", [userId]);
}

export function makeUpdateUserQuery(user: Partial<User>) {
  const [clause, values, nextIdx] = makeSetClause(user, { exclude: ["id"] });
  return {
    text: `UPDATE users SET ${clause} WHERE id = $${nextIdx}`,
    values: [...values, user.id],
  };
}

export async function updateUser(container: DIContainer, user: Partial<User>) {
  const dbClient = container.postgresClient;

  return dbClient.query(makeUpdateUserQuery(user));
}
