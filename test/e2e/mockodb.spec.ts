import { MongoClient } from "mongodb";
import { MockoDb, preload } from "../../src";
import { ListDatabasesResult } from "../../src/types/mongodb";

describe("mockodb", () => {
  beforeAll(async () => {
    jest.setTimeout(100_000); // Preload might take a while.
    await preload();
  });

  it("client can connect after boot", async () => {
    const url = "mongodb://localhost:27017";
    await expect(MongoClient.connect(url)).rejects.toThrowError(
      "failed to connect"
    );

    const mockoDb = await MockoDb.boot();
    expect(mockoDb.url.href).toEqual(url);

    try {
      await expect(MongoClient.connect(url)).resolves.toBeInstanceOf(
        MongoClient
      );
    } finally {
      await mockoDb.shutdown();
    }
  });

  it("client cannot connect after shutdown", async () => {
    const mockoDb = await MockoDb.boot();
    const url = mockoDb.url;

    try {
      await expect(MongoClient.connect(url.href)).resolves.toBeInstanceOf(
        MongoClient
      );
    } finally {
      await mockoDb.shutdown();
    }

    await expect(MongoClient.connect(url.href)).rejects.toThrowError(
      "failed to connect"
    );
  });

  it("starts multiple concurrent servers", async () => {
    const firstMockoDb = await MockoDb.boot();
    const secondMockoDb = await MockoDb.boot().catch(async err => {
      await firstMockoDb.shutdown();
      throw err;
    });

    expect(firstMockoDb.url).not.toEqual(secondMockoDb.url);
    await Promise.all([
      MongoClient.connect(firstMockoDb.url.href),
      MongoClient.connect(secondMockoDb.url.href)
    ]);

    await Promise.all([firstMockoDb, secondMockoDb].map(db => db.shutdown()));
  });

  describe("prepared", () => {
    let mockoDb: MockoDb;

    beforeEach(async () => {
      mockoDb = await MockoDb.boot();
    });

    afterEach(async () => {
      await mockoDb.shutdown();
    });

    it("allows client to CRUD", async () => {
      const client = await MongoClient.connect(mockoDb.url.href);
      const db = client.db();
      const collection = db.collection("e2eTest");

      const entity = { insert: "me" };
      await collection.insertOne(entity);
      const [inserted] = await collection.find().toArray();
      expect(inserted).toEqual(expect.objectContaining(entity));

      const newEntity = { insert: "updated" };
      await collection.updateOne(entity, {
        $set: newEntity
      });
      const [updated] = await collection.find().toArray();
      expect(updated._id).toEqual(inserted._id);
      expect(updated).toEqual(expect.objectContaining(newEntity));

      await collection.deleteOne(updated);
      const contents = await collection.find().toArray();
      expect(contents.length).toEqual(0);
    });

    it("can reset all databases", async () => {
      const client = await MongoClient.connect(mockoDb.url.href);
      const dbs = [client.db("1"), client.db("2")];
      await Promise.all(
        dbs.map(async db => {
          const collection = await db.createCollection("e2eTest");
          await collection.insertOne({ insert: "me" });
        })
      );

      const expectedNames = dbs.map(db => db.databaseName);
      expect(await getActualDatabaseNames()).toEqual(
        expect.arrayContaining(expectedNames)
      );

      await mockoDb.reset();

      expect(await getActualDatabaseNames()).not.toEqual(
        expect.arrayContaining(expectedNames)
      );

      async function getActualDatabaseNames() {
        const result: ListDatabasesResult = await client
          .db()
          .admin()
          .listDatabases();

        return result.databases.map(db => db.name);
      }
    });
  });
});
