/* eslint-disable */

const fs = require("fs");
const shell = require("shelljs");

const Parser = require("./Parser");
const File = require("./File");

class Generator {
  constructor(name, template, variables = {}) {
    this.variables = { ...variables, name };
    this.variableTemplate = "%var%";
    this.outputDirectory = null;

    this.templatePath = `${__dirname}/../templates/${template}.html`;
    this.template = null;

    this.structure = null;
    this.files = [];
  }

  async readTemplate() {
    if (!shell.test("-e", this.templatePath)) {
      console.log(`Template file not found on '${this.templatePath}'`);
      return false;
    }
    this.template = await fs.readFileSync(this.templatePath, {
      encoding: "utf8"
    });
  }

  parseTemplate() {
    if (!this.template) return;

    const parser = new Parser(this.template);

    this.files = parser.dom.files;

    this.scripts = parser.dom.scripts.map(item => {
      const Structure = {
        getVariable: name => this.variables[name],
        setVariable: (name, value) => {
          this.variables[name] = value;
        },
        name: this.variables.name
      };

      eval(item.content);

      return item;
    });

    this.outputDirectory = this.applyVariables(
      parser.dom.structure.attributes.out
    );
    if (!this.outputDirectory) this.outputDirectory = ".";

    this.files = parser.dom.files
      .filter(item => !!item.attributes.name)
      .map(item => {
        const content = this.applyVariables(item.content);
        const file = new File(content);
        file.save(this.applyVariables(item.attributes.name));
        return file;
      });
  }

  createFiles() {
    if (!shell.test("-e", this.outputDirectory)) {
      console.log(
        `Directory '${this.outputDirectory}' doesn't exist. Creating...`
      );
      shell.mkdir("-p", this.outputDirectory);
    }

    const output = name => `${this.outputDirectory}/${name}`;

    this.files.forEach(file => {
      const out = output(file.name);

      if (shell.test("-e", out)) {
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
        new RegExp(this.variableTemplate.replace("var", variable), "gi"),
        this.variables[variable]
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
