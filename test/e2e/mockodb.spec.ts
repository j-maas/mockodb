import { MockoDb } from "../../src/index";
import { MongoClient } from "mongodb";

describe("mockodb", () => {
  it("allows client to CRUD", async () => {
    const mockoDb = new MockoDb();
    await mockoDb.boot();

    const client = await MongoClient.connect(mockDb.url.toString());
    const db = client.db();
    const collection = db.collection("e2eTest");

    const entity = { insert: "me" };
    await collection.insertOne(entity);
    const inserted = await collection.find().toArray();
    expect(inserted).toContainEqual(entity);
    expect(inserted.length).toEqual(1);

    const newEntity = { update: "me" };
    const updatedEntity = await collection.updateOne(entity, newEntity);
    expect(updatedEntity).toEqual(newEntity);
    const updated = await collection.find().toArray();
    expect(updated).toContainEqual(updated);
    expect(updated.length).toEqual(1);

    await collection.deleteOne(entity);
    const contents = await collection.find().toArray();
    expect(contents.length).toEqual(0);

    await mockoDb.shutdown();
  });
});
