import { Client } from "pg";
import { DIContainer } from "./di";

interface KeyUsageLogRow {
  id: string;
  key_hash: Buffer;
  owner_id: string;
  unit_count: number;
  operation: string;
  date_executed: Date;
}

export class KeyUsageLogRepo {
  private _dbClient: Client;

  constructor(container: DIContainer) {
    this._dbClient = container.postgresClient;
  }

  async insert(row: Omit<KeyUsageLogRow, "id">) {
    const query = `
      INSERT INTO key_usage_log (key_hash, owner_id, unit_count, operation, date_executed)
      VALUES ($1, $2, $3, $4, $5)
    `;
    const values = [
      row.key_hash,
      row.owner_id,
      row.unit_count,
      row.operation,
      row.date_executed,
    ];
    return await this._dbClient.query(query, values);
  }
}
