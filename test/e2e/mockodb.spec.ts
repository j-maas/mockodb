import { MockoDb } from "../../src";
import { MongoClient } from "mongodb";

describe("mockodb", () => {
  it("client can connect after boot", async () => {
    const url = "mongodb://localhost:27017";
    await expect(MongoClient.connect(url)).rejects.toThrowError(
      "failed to connect"
    );

    const mockoDb = await MockoDb.boot();
    expect(mockoDb.url).toEqual(url);

    await expect(MongoClient.connect(url)).resolves.toBeInstanceOf(MongoClient);

    await mockoDb.shutdown();
  });

  it("client cannot connect after shutdown", async () => {
    const mockoDb = await MockoDb.boot();
    const url = mockoDb.url;

    await expect(MongoClient.connect(url)).resolves.toBeInstanceOf(MongoClient);

    await mockoDb.shutdown();

    await expect(MongoClient.connect(url)).rejects.toThrowError(
      "failed to connect"
    );
  });

  it("allows client to CRUD", async () => {
    const mockoDb = await MockoDb.boot();

    const client = await MongoClient.connect(mockoDb.url.toString());
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

    await mockoDb.shutdown();
  });
});
