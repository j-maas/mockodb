#!/usr/bin/env node

const path = require("path");
const { preload } = require(path.resolve(__dirname, "../dist"));

preload()
  .then(() => {
    console.log("Preloaded MockoDB successfully.");
    process.exit(0);
  })
  .catch(err => {
    console.error("Error preloading MockoDB:", err);
    process.exit(1);
  });
