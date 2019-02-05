#!/usr/bin/env node

const Structure = require('./core/Structure');

try {
  const tpl = new Structure('./templates/a15-component.scml', 'component-name', {
    date: '28-08-1994',
  });
} catch(err) {
  console.log(err);
}

