import { Client } from "pg";
import { DIContainer } from "./di";
import { makeInsertClause } from "./util";

export interface WebAuthnChallengeRow {
  challenge: string;
  user_id: string;
  is_registration: boolean;
  created_at: Date;
}

export interface ICreateWebAuthnChallenge {
  challenge: string;
  user_id: string;
  is_registration: boolean;
  created_at?: Date;
}

export class WebAuthnChallengeRepo {
  private _dbClient: Client;

  constructor(container: DIContainer) {
    this._dbClient = container.postgresClient;
  }

  async insert(challenge: WebAuthnChallengeRow) {
    const [insertClause, values] = makeInsertClause(challenge);

    const query = `INSERT INTO webauthn_challenges ${insertClause}`;
    return await this._dbClient.query(query, values);
  }

  async getByChallenge(challenge: string) {
    const query = `SELECT * FROM webauthn_challenges WHERE challenge = $1`;
    const res = await this._dbClient.query(query, [challenge]);

    return res.rows[0] as WebAuthnChallengeRow;
  }

  async deleteByChallenge(challenge: string) {
    const query = `DELETE FROM webauthn_challenges WHERE challenge = $1`;
    return await this._dbClient.query(query, [challenge]);
  }
}
