const path = require("path");
const { openPortAndDataDir } = require(path.resolve(
  __dirname,
  "../../../src/mutex"
));

openPortAndDataDir()
  .then(result => {
    process.send(result);
    process.disconnect();
  })
  .catch(err => {
    console.error(`Encountered err in process with pid ${process.pid}:\n`, err);
    process.exit(1);
  });
