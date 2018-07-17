import * as fsCallback from "fs";
import * as childProcessCallback from "child_process";
import * as path from "path";
import { promisify } from "util";
import { ensureDir, Path, removeDir } from "../../src/fs-utils";
import { openPortAndDataDir } from "../../src/mutex";

const fs = {
  readdir: promisify(fsCallback.readdir),
  mkdtemp: promisify(fsCallback.mkdtemp),
  stat: promisify(fsCallback.stat)
};
const childProcess = {
  fork: childProcessCallback.fork
};

const fixtureDir = path.resolve(__dirname, "fixtures");

describe("mutex", () => {
  it("returns a port number", async () => {
    const { port } = await openPortAndDataDir();
    expect(port).not.toBeUndefined();
  });

  describe("with temp dir", () => {
    let dataDirRoot: Path;

    beforeEach(async () => {
      const tempDir = path.join(__dirname, "temp");
      ensureDir(tempDir);
      dataDirRoot = await fs.mkdtemp(path.join(tempDir, "dataDir-"));

      // Ensure it is empty.
      const files = await fs.readdir(dataDirRoot);
      expect(files.length).toEqual(0);
    });

    afterEach(async () => {
      await removeDir(dataDirRoot);
    });

    it("returns a path to a new folder", async () => {
      const { dataDir } = await openPortAndDataDir(dataDirRoot);
      await fs.stat(dataDir);
    });

    it("can open multiple ports and data dirs concurrently", async () => {
      const childrenCount = 3;
      const children = range(childrenCount).map(() => {
        const execModule = path.join(fixtureDir, "openPortAndDataDir");
        const child = childProcess.fork(execModule);
        return new Promise((resolve, reject) => {
          child.on("message", message => {
            console.log("Got message");
            resolve(message);
          });
          child.on("exit", () => {
            console.log("exiting");
          });
          child.on("error", reject);
        });
      });

      const results = await Promise.all(children);

      expect(results[0]).not.toEqual(results[1]);
    });
  });
});

function range(size: number) {
  return Array.from({ length: size }, (value, key) => key);
}
