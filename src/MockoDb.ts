import { MongoClient } from "mongodb";
import { MongodHelper } from "mongodb-prebuilt";
import * as path from "path";
import { URL } from "url";
import { ensureDir, Path, removeDir } from "./fs-utils";
import { ListDatabasesResult } from "./types/mongodb";
import * as getPort from "get-port";

const moduleDir = path.resolve(__dirname, "../");

export class MockoDb {
  public static async boot() {
    const port = (await getPort({ port: 27017 })).toString();
    const dataDir = path.join(moduleDir, "mockodb-data", port);
    ensureDir(dataDir);

    const mongodHelper = new MongodHelper(
      [
        "--port",
        port,
        "--dbpath",
        dataDir,
        "--storageEngine",
        "ephemeralForTest"
      ],
      {
        downloadDir: path.join(moduleDir, "mockodb-download")
      }
    );
    await mongodHelper.run();
    return new MockoDb(new URL(`mongodb://localhost:${port}`), dataDir);
  }

  constructor(public url: URL, private dataDir: Path) {}

  public async shutdown() {
    const client = await this.getClient();
    const db = client.db();

    await db.executeDbAdminCommand({ shutdown: 1 }).catch(err => {
      const isShutdownError = /connection \d+ to .+ closed/.test(err.message);
      if (!isShutdownError) {
        throw err;
      }
    });

    await removeDir(this.dataDir);
  }

  /**
   * Drops all databases except admin, config, and local.
   */
  public async reset() {
    const client = await this.getClient();
    const db = client.db();

    const result: ListDatabasesResult = await db.admin().listDatabases();
    const allDbs = result.databases.map(database => database.name);

    const toDrop = allDbs.filter(
      name => !["admin", "config", "local"].includes(name)
    );

    await Promise.all(
      toDrop.map(async dbName => {
        await client.db(dbName).dropDatabase();
      })
    );
  }

  private async getClient() {
    return MongoClient.connect(this.url.href);
  }
}
