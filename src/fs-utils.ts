import * as childProcessCallback from "child_process";
import * as fsCallback from "fs";
import { promisify } from "util";

const fs = {
  mkdir: promisify(fsCallback.mkdir)
};
const childProcess = {
  exec: promisify(childProcessCallback.exec)
};

export function ensureDir(dirPath: Path) {
  fs.mkdir(dirPath).catch(err => {
    if (err.code !== "EEXIST") {
      throw err;
    }
  });
}

export async function removeDir(dirPath: Path) {
  await childProcess.exec(`rm -rf ${dirPath}`);
}

export type Path = string;
