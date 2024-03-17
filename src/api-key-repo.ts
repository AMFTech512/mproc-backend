import { Client } from "pg";
import { DIContainer } from "./di";
import { generateSecureRandomString } from "./util";
import { createHash } from "crypto";

export interface ApiKeyRow {
  key_hash: Buffer;
  owner_id: string;
  created_at: Date;
  name: string;
  is_active: boolean;
}

export class ApiKeyRepo {
  private _dbClient: Client;

  constructor(container: DIContainer) {
    this._dbClient = container.postgresClient;
  }

  /**
   * Generates a random key and its hash.
   * @returns A tuple of [key, key hash].
   */
  static generateKeyHashPair(): [string, Buffer] {
    const key = generateSecureRandomString(16);
    const keyHash = ApiKeyRepo.hashKey(key);

    return [key, keyHash];
  }

  static hashKey(key: string): Buffer {
    return createHash("sha256").update(key).digest();
  }

  async insert(row: ApiKeyRow) {
    return await this._dbClient.query(
      "INSERT INTO api_keys (key_hash, owner_id, created_at, name, is_active) VALUES ($1, $2, $3, $4, $5)",
      [row.key_hash, row.owner_id, row.created_at, row.name, row.is_active]
    );
  }

  async getByKeyHash(keyHash: Buffer) {
    const res = await this._dbClient.query(
      "SELECT * FROM api_keys WHERE key_hash = $1",
      [keyHash]
    );
    return res.rows[0] as ApiKeyRow;
  }

  async deleteByKeyHash(keyHash: Buffer) {
    return await this._dbClient.query(
      "DELETE FROM api_keys WHERE key_hash = $1",
      [keyHash]
    );
  }
}
