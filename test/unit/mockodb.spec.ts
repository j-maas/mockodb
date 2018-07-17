import { stat as statCallback } from "fs";
import { promisify } from "util";
import { MockoDb } from "../../src";

const stat = promisify(statCallback);

describe("MockoDB", () => {
  it("cleans data dir when shut down", async () => {
    const mockoDb = await MockoDb.boot();
    const dataDir = (mockoDb as any).dataDir;
    await stat(dataDir);
    await mockoDb.shutdown();
    await expect(stat(dataDir)).rejects.toEqual(
      expect.objectContaining({ code: "ENOENT" })
    );
  });
});
