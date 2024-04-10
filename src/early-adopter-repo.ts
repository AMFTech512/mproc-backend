import { Base } from "airtable";
import { DIContainer } from "./di";

export class EarlyAdopterRepo {
  private _base: Base;

  constructor(container: DIContainer) {
    // TODO: move this into a config?
    this._base = container.airtableClient.base("appwx5TpNTb8PdfYi");
  }

  async insertEarlyAdopter(email: string) {
    // TODO: also move this table name into a config?
    return await this._base("Early adopters").create([{ fields: { email } }]);
  }
}
