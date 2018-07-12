# MockoDB

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
import { preload } from "mockodb"

describe('test suite', () => {
  beforeAll(async () => {
    jest.setTimeout(100_000); // Preload might take a while.
    await preload();
  });

  // ...
});
```

[mongo-unit]: https://github.com/mikhail-angelov/mongo-unit
