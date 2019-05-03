/* eslint-disable */

const fs = require("fs");
const vm = require("vm");
const shell = require("shelljs");

const Parser = require("./Parser");
const File = require("./File");

class Generator {
  constructor(name, templatePath, variables = {}, options = {}) {
    const defaults = {
      variableTemplate: "%var%",
      ...options
    };

    this.variables = { ...variables, name };
    this.variableTemplate = defaults.variableTemplate;

    this.outputDirectory = null;
    this.templatePath = templatePath;

    this.template = null;

    this.structure = null;
    this.files = [];
    this.scripts = [];
  }

  async readTemplate() {
    if (!shell.test("-e", this.templatePath)) {
      console.log(`Template file not found at '${this.templatePath}'`);
      return false;
    }

    this.template = await fs.readFileSync(this.templatePath, {
      encoding: "utf8"
    });

    return true;
  }

  parseTemplate() {
    if (!this.template) return;

    const template = new Parser(this.template, true);

    this.files = template.root.files;

    this.scripts = template.root.scripts.map(item => {
      this.evaluateScript(item.content);
      return item;
    });

    this.outputDirectory = this.applyVariables(
      template.root.structure.attributes.out
    );

    if (!this.outputDirectory) this.outputDirectory = ".";

    this.files = template.root.files
      .filter(item => !!item.attributes.name)
      .map(item => {
        const content = this.applyVariables(item.content);
        const file = new File(content);
        file.save(this.applyVariables(item.attributes.name));
        return file;
      });
  }

  async evaluateScript(code = "") {
    const GenerateStructure = {
      name: this.variables.name,
      getVariable: name => this.variables[name],
      setVariable: (name, value) => {
        this.variables[name] = value;
      }
    };

    const sandbox = {
      GenerateStructure,
      console
    };

    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);
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

module.exports = Generator;
