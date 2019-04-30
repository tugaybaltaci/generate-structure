/* eslint-disable */

const fs = require('fs');
const shell = require('shelljs');
const HTMLParser = require('node-html-parser');

const File = require('./File');

class Generate {
  constructor(name, template, variables = {}) {
    this.variables = { ...variables, name };
    this.variableTemplate = '%var%';
    this.outputDirectory = null;

    this.templatePath = `${__dirname}/../templates/${template}.html`;
    this.template = null;

    this.structure = null;
    this.files = [];
  }

  async readTemplate() {
    if (!shell.test('-e', this.templatePath)) {
      console.log(`Template file not found on '${this.templatePath}'`);
      return false;
    }
    this.template = await fs.readFileSync(this.templatePath, { encoding: 'utf8' });

    return this.template;
  }

  parseTemplate() {
    if (!this.template) return;

    const root = HTMLParser.parse(this.template, {
      script: true,
    });

    this.structure = root.querySelector('structure');

    // Scripts should execute first because apply variables correctly.
    this.scripts = this.structure.querySelectorAll('script').map(item => {
      const Structure = {
        getVariable: name => this.variables[name],
        passVariable: (name, value) => {
          this.variables[name] = value;
        },
      };

      eval(item.innerHTML);

      return item;
    });

    this.outputDirectory = this.applyVariables(this.structure.attributes.out);
    if (!this.outputDirectory) this.outputDirectory = '.';

    this.files = this.structure
      .querySelectorAll('file')
      .filter(item => !!item.attributes.name)
      .map(item => {
        const file = new File(this.applyVariables(item.innerHTML));
        file.save(this.applyVariables(item.attributes.name));
        return file;
      });
  }

  createFiles() {
    if (!shell.test('-e', this.outputDirectory)) {
      console.log(`Directory '${this.outputDirectory}' doesn't exist. Creating...`);
      shell.mkdir('-p', this.outputDirectory);
    }

    const output = name => `${this.outputDirectory}/${name}`;

    this.files.map(file => {
      const out = output(file.name);

      if (shell.test('-e', out)) {
        console.log(`File '${file.name}' already exists. Skipped.`);
      } else {
        fs.writeFile(out, file.content, err => {
          if (!err) console.log(`File: '${file.name}' created.`);
        });
      }
    });
  }

  applyVariables(content) {
    let contentWithVariables = content;
    for (const variable in this.variables) {
      contentWithVariables = contentWithVariables.replace(
        new RegExp(this.variableTemplate.replace('var', variable), 'gi'),
        this.variables[variable],
      );
    }
    return contentWithVariables;
  }

  async run() {
    await this.readTemplate();
    this.parseTemplate();
    this.createFiles();
  }
}

module.exports = Generate;
