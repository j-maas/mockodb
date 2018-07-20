import { MongoClient } from "mongodb";
import { URL } from "url";

export class DatabaseHandle {
  constructor(public name: string, private baseUrl: URL) {}

  get url() {
    return new URL(this.baseUrl.href + `/${this.name}`);
  }

  public async drop() {
    const client = await MongoClient.connect(this.url.href);
    await client.db().dropDatabase();
  }
}
