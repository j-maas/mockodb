import { MockoDb } from "./MockoDb";

/**
 * Downloads the MongoDB binaries.
 */
export async function preload() {
  const mockoDb = await MockoDb.boot();
  await mockoDb.shutdown();
}
