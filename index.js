#!/usr/bin/env node

const Generate = require('./core/Generate');

const structure = new Generate('./templates/a15-component.scml', 'component-name', {
  date: '28-08-1994',
});
