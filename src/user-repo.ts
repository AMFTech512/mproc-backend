import { Client } from "pg";
import { DIContainer } from "./di";
import { makeSetClause } from "./util";

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
}

export class UserRepo {
  private _dbClient: Client;

  constructor(container: DIContainer) {
    this._dbClient = container.postgresClient;
  }

  async getById(userId: string): Promise<UserRow | undefined> {
    const res = await this._dbClient.query(
      "SELECT * FROM users WHERE id = $1",
      [userId]
    );
    const user = res.rows[0] as UserRow;
    return user;
  }

  async getByEmail(email: string): Promise<UserRow | undefined> {
    const res = await this._dbClient.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    const user = res.rows[0] as UserRow;
    return user;
  }

  async insert(user: UserRow) {
    return this._dbClient.query(
      "INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)",
      [user.id, user.email, user.password_hash]
    );
  }

  async delete(userId: string) {
    return this._dbClient.query("DELETE FROM users WHERE id = $1", [userId]);
  }

  static makeUpdateQuery(user: Partial<UserRow>) {
    const [clause, values, nextIdx] = makeSetClause(user, { exclude: ["id"] });
    return {
      text: `UPDATE users SET ${clause} WHERE id = $${nextIdx}`,
      values: [...values, user.id],
    };
  }

  async update(user: Partial<UserRow>) {
    return this._dbClient.query(UserRepo.makeUpdateQuery(user));
  }
}
