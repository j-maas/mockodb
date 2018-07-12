import { MongodHelper } from "mongodb-prebuilt";
import * as path from "path";
import * as fsCallback from "fs";
import { promisify } from "util";
import { MongoClient } from "mongodb";

// Wrap in Promise
const fs = {
  mkdir: promisify(fsCallback.mkdir)
};

export class MockoDb {
  public static async boot() {
    const dataDir = path.join(__dirname, "mockodb");
    ensureDir(dataDir);

    const mongodHelper = new MongodHelper([
      "--dbpath",
      dataDir,
      "--storageEngine",
      "ephemeralForTest"
    ]);
    await mongodHelper.run();
    return new MockoDb(mongodHelper, "mongodb://localhost:27017");
  }

  constructor(private mongodHelper: MongodHelper, public url: Url) {}

  public async shutdown() {
    const client = await MongoClient.connect(this.url);
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
type Url = string;
