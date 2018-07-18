import * as fsCallback from "fs";
import getPort = require("get-port");
import { MongoClient } from "mongodb";
import { MongodHelper } from "mongodb-prebuilt";
import * as path from "path";
import { URL } from "url";
import { promisify } from "util";
import { ListDatabasesResult } from "./types/mongodb";

// Wrap in Promise
const fs = {
  mkdir: promisify(fsCallback.mkdir)
};

const moduleDir = path.resolve(__dirname, "../");

export class MockoDb {
  public static async boot() {
    const port = (await getPort({ port: 27017 })).toString();
    const dataDir = path.join(moduleDir, "mockodb-data", port);
    ensureDir(dataDir);

    const mongodHelper = new MongodHelper(
      [
        "--dbpath",
        dataDir,
        "--port",
        port,
        "--storageEngine",
        "ephemeralForTest"
      ],
      {
        downloadDir: path.join(moduleDir, "mockodb-download")
      }
    );
    await mongodHelper.run();
    return new MockoDb(new URL(`mongodb://localhost:${port}`));
  }

  constructor(public url: URL) {}

  public async shutdown() {
    const client = await this.getClient();
    const db = client.db();

    await db.executeDbAdminCommand({ shutdown: 1 }).catch(err => {
      const isShutdownError = /connection \d+ to .+ closed/.test(err.message);
      if (!isShutdownError) {
        throw err;
      }
    });
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

async function ensureDir(dirPath: Path) {
  fs.mkdir(dirPath).catch(async err => {
    if (err.code === "ENOENT") {
      const parent = path.dirname(dirPath);
      if (parent !== "/") {
        await ensureDir(parent);
      }
      return ensureDir(dirPath);
    }

    if (err.code !== "EEXIST") {
      throw err;
    }
  });
}

type Path = string;
