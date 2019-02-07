#!/usr/bin/env node

const Generate = require('./core/Generate');

const structure = new Generate('component-name', './templates/a15-component.scml', {
  date: '28-08-1994',
});
