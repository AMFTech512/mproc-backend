import { Client } from "pg";
import { DIContainer } from "./di";
import { makeInsertClause, makeSetClause } from "./util";

export interface UserRow {
  id: string;
  name: string;
  email: string;
}

export interface IUserInsert {
  id: string;
  name?: string;
  email?: string;
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

  async insert(user: IUserInsert) {
    const [insertClause, values] = makeInsertClause(user);
    const query = `INSERT INTO users ${insertClause}`;
    return await this._dbClient.query(query, values);
  }

  async delete(userId: string) {
    return await this._dbClient.query("DELETE FROM users WHERE id = $1", [
      userId,
    ]);
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
