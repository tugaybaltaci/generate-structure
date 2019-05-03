#!/usr/bin/env node

const cli = require("command-line-args");
const GenerateStructure = require("./core/Generator");

const options = cli([
  { name: "name", type: String, defaultOption: true },
  { name: "templatePath", type: String, alias: "t" }
]);

const structure = new GenerateStructure(options.name, options.template);
structure.run();
