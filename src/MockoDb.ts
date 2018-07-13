import { MongodHelper } from "mongodb-prebuilt";
import * as path from "path";
import * as fsCallback from "fs";
import { promisify } from "util";
import { MongoClient } from "mongodb";
import { URL } from "url";

// Wrap in Promise
const fs = {
  mkdir: promisify(fsCallback.mkdir)
};

const moduleDir = path.resolve(__dirname, "../");

/**
 * Downloads the MongoDB binaries.
 */
export async function preload() {
  const mockoDb = await MockoDb.boot();
  await mockoDb.shutdown();
}

export class MockoDb {
  public static async boot() {
    const dataDir = path.join(moduleDir, "mockodb-data");
    ensureDir(dataDir);

    const mongodHelper = new MongodHelper(
      ["--dbpath", dataDir, "--storageEngine", "ephemeralForTest"],
      {
        downloadDir: path.join(moduleDir, "mockodb-download")
      }
    );
    await mongodHelper.run();
    return new MockoDb(mongodHelper, new URL("mongodb://localhost:27017"));
  }

  constructor(private mongodHelper: MongodHelper, public url: URL) {}

  public async shutdown() {
    const client = await MongoClient.connect(this.url.href);
    await client
      .db()
      .executeDbAdminCommand({ shutdown: 1 })
      .catch(err => {
        const isShutdownError = /connection \d+ to .+ closed/.test(err.message);
        if (!isShutdownError) throw err;
      });
  }
}

function ensureDir(path: Path) {
  fs.mkdir(path).catch(err => {
    if (err.code !== "EEXIST") throw err;
  });
}

type Path = string;
