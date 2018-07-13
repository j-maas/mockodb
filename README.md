# MockoDB

[![npm](https://img.shields.io/npm/v/mockodb.svg)](https://www.npmjs.com/package/mockodb)
[![build status](https://travis-ci.org/Y0hy0h/mockodb.svg?branch=master)](https://travis-ci.org/Y0hy0h/mockodb)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

An in-memory MongoDB as a mock in unit tests.

> Inspired by [mongo-unit].

## Usage

```typescript
import { MockoDb } from "mockodb";
import { MongoClient } from "mongodb"

async function demo() {
  const mockoDb = await MockoDb.boot();

  // You can now connect to the database:
  const client = await MongoClient.connect(mockoDb.url);
  ...

  // You need to take care of shutting down the db:
  await mockoDb.shutdown();
}
```

### Preloading

Note that `MockoDb.boot()` might attempt to download the MongoDB binaries on the
first run. You can preload those libraries explicitly with the `preload()`
function:

```typescript
import { preload } from "mockodb";

describe("test suite", () => {
  beforeAll(async () => {
    jest.setTimeout(100_000); // Preload might take a while.
    await preload();
  });

  // ...
});
```

### Download Directory

MockoDB will download the MongoDB binaries into its folder. Therefore you can
simply cache your `node_modules` on your CI, making it download the MongoDB
binaries once on the first run and whenever you clear your cache.

[mongo-unit]: https://github.com/mikhail-angelov/mongo-unit
