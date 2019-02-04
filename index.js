#!/usr/bin/env node

const Schema = require('./core/Schema');

const tpl = new Schema('./templates/a15-component.scml', 'component-name');

tpl.createAll();
