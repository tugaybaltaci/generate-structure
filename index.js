#!/usr/bin/env node

const Schema = require('./core/Schema');

const tpl = new Schema('./templates/test.scml', 'component-name');

tpl.createAll();
