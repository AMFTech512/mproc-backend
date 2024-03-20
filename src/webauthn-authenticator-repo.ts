import { AuthenticatorTransportFuture } from "@simplewebauthn/types";
import { Client } from "pg";
import { DIContainer } from "./di";
import { makeInsertClause } from "./util";

export interface AuthenticatorRow {
  credential_id: Buffer;
  credential_public_key: Buffer;
  counter: string;
  credential_device_type: "singleDevice" | "multiDevice";
  is_credential_backed_up: boolean;
  transports?: AuthenticatorTransportFuture[];
  created_at: Date;
  user_id: string;
}

export interface IAuthenticatorInsert {
  credential_id: Buffer;
  credential_public_key: Buffer;
  counter?: string;
  credential_device_type: "singleDevice" | "multiDevice";
  is_credential_backed_up?: boolean;
  transports?: AuthenticatorTransportFuture[];
  created_at?: Date;
  user_id: string;
}

export class WebAuthnAuthenticatorRepo {
  private _dbClient: Client;

  constructor(container: DIContainer) {
    this._dbClient = container.postgresClient;
  }

  async insert(authenticator: IAuthenticatorInsert) {
    const [insertClause, values] = makeInsertClause(authenticator);

    const query = `INSERT INTO webauthn_authenticators ${insertClause}`;
    return await this._dbClient.query(query, values);
  }

  async getByUserId(userId: string): Promise<AuthenticatorRow[]> {
    const res = await this._dbClient.query(
      "SELECT * FROM webauthn_authenticators WHERE user_id = $1",
      [userId]
    );
    return res.rows as AuthenticatorRow[];
  }

  async getByCredentialId(
    credentialId: Buffer
  ): Promise<AuthenticatorRow | undefined> {
    const res = await this._dbClient.query(
      "SELECT * FROM webauthn_authenticators WHERE credential_id = $1",
      [credentialId]
    );
    return res.rows[0] as AuthenticatorRow;
  }

  async deleteByCredentialId(credentialId: Buffer) {
    return this._dbClient.query(
      "DELETE FROM webauthn_authenticators WHERE credential_id = $1",
      [credentialId]
    );
  }
}
