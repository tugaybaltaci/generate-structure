#!/usr/bin/env node

const cli = require('command-line-args');
const Generate = require('./core/Generate');

const options = cli([
  { name: 'name', type: String, defaultOption: true },
  { name: 'template', type: String, alias: 't' },
]);

const structure = new Generate(options.name, options.template);
