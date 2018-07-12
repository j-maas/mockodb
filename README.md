# MockoDB

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

An in-memory MongoDB as a mock in unit tests.

> Inspired by [mongo-unit].

## Usage

```typescript
import { MockoDb } from "mockodb";
import { MongoClient } from "mongodb"

async function demo() {
  // Boot up the db. Note that it might download mongodb binaries on first boot.
  const mockoDb = await MockoDb.boot();

  // You can now connect to the database:
  const client = await MongoClient.connect(mockoDb.url);
  ...

  // You need to take care of shutting down the db:
  await mockoDb.shutdown();
}
```

[mongo-unit]: https://github.com/mikhail-angelov/mongo-unit
