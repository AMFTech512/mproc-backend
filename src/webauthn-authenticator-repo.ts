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

  // plain arrays aren't valid json in postgres, so we have these helper functions to convert to and from json
  static transportsToObj(authenticator: Pick<AuthenticatorRow, "transports">) {
    const newAuthenticator = {
      ...authenticator,
      transports: { arr: authenticator.transports },
    };
    return newAuthenticator;
  }

  static transportsFromObj(
    authenticator: Pick<AuthenticatorRow, "transports">
  ) {
    if (!authenticator?.transports) return;
    authenticator.transports = (authenticator.transports as any)?.arr;
    return authenticator;
  }

  async insert(authenticator: IAuthenticatorInsert) {
    const _authenticator =
      WebAuthnAuthenticatorRepo.transportsToObj(authenticator);
    const [insertClause, values] = makeInsertClause(_authenticator);

    const query = `INSERT INTO webauthn_authenticators ${insertClause}`;
    return await this._dbClient.query(query, values);
  }

  async getByUserId(userId: string): Promise<AuthenticatorRow[]> {
    const res = await this._dbClient.query(
      "SELECT * FROM webauthn_authenticators WHERE user_id = $1",
      [userId]
    );
    return res.rows.map((auth) =>
      WebAuthnAuthenticatorRepo.transportsFromObj(auth)
    ) as AuthenticatorRow[];
  }

  async getByCredentialId(
    credentialId: Buffer
  ): Promise<AuthenticatorRow | undefined> {
    const res = await this._dbClient.query(
      "SELECT * FROM webauthn_authenticators WHERE credential_id = $1",
      [credentialId]
    );
    const authenticator = WebAuthnAuthenticatorRepo.transportsFromObj(
      res.rows[0]
    );
    return authenticator as AuthenticatorRow;
  }

  async deleteByCredentialId(credentialId: Buffer) {
    return this._dbClient.query(
      "DELETE FROM webauthn_authenticators WHERE credential_id = $1",
      [credentialId]
    );
  }
}
