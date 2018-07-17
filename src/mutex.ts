import * as fsCallback from "fs";
import * as getPort from "get-port";
import * as path from "path";
import { promisify } from "util";
import { ensureDir, Path } from "./fs-utils";

const fs = {
  mkdir: promisify(fsCallback.mkdir)
};

const moduleDir = path.resolve(__dirname, "../");

export async function openPortAndDataDir(
  dataDirRoot: Path = moduleDir,
  preferredPort: Port = 0
): Promise<{ port: Port; dataDir: Path }> {
  const port = await getPort({ port: preferredPort });
  ensureDir(dataDirRoot);
  const dataDir = path.join(dataDirRoot, port.toString());
  await fs.mkdir(dataDir);
  return { port, dataDir };
}

export type Port = number;
