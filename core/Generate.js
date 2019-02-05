const fs = require('fs');
const DomParser = require('dom-parser');
const shell = require('shelljs');

const parser = new DomParser();


class Generate {
  constructor(template, name, variables = {}) {
    this.variables = { ...variables, name };
    this.templatePath = template;
    this.template = null;

    this.structure = null;
    this.folders = [];
    this.files = [];
    this.scripts = [];

    this.run();
  }

  async readTemplate() {
    if (!shell.test('-e', this.templatePath)) throw new Error("Given template file not found");
    this.template = await fs.readFileSync(this.templatePath, {encoding: 'utf8'});
  }

  parseTemplate() {
    if (!this.template) return;

    const dom = parser.parseFromString(this.template);

    this.structure = dom.getElementsByTagName('structure')[0];
    this.files = dom.getElementsByTagName('file');
    this.folders = dom.getElementsByTagName('folder');
    this.scripts = dom.getElementsByTagName('script');
  }

  async run() {
    await this.readTemplate();
    this.parseTemplate();
  }

}

module.exports = Generate;