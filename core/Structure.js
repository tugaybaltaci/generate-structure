const fs = require('fs');
const DomParser = require('dom-parser');
const shell = require('shelljs');
const parser = new DomParser();

function Structure(template, name, variables = {}, config = null) {
  if (!shell.test('-e', template)) throw new Error("Given template file not found");
  this.template = template;
  this.variableRef = '%$%';
  this.variables = { ...variables, name };

  this.create();
}

Structure.prototype.parse = function(markup) {
  return parser.parseFromString(markup);
};

Structure.prototype.evaluateScript = function(script) {
  const Structure = {
    getVariable: (name) => {
      return this.variables[name];
    },
    passVariable: (name, value) => {
      this.variables[name] = value;
    }
  }

  eval(script);
};

Structure.prototype.dispatchVariables =  function (string) {
  for(let variable in this.variables) {
    // TODO: Make variable template for prevent conflicts any language.

    string = string.replace(new RegExp(`%${variable}%`, 'gi'), this.variables[variable]);
  }
  return string;
}

Structure.prototype.stripUnnecessaryIndents = function(content) {
  const minIndentation = str => {
    const match = str.match(/^[ \t]*(?=\S)/gm);
    if (!match) return 0;
    return Math.min.apply(Math, match.map(x => x.length));
  }

  const stripIndentation = str => {
    const indent = minIndentation(str);
    if (indent === 0) {
      return str;
    }
    return str.replace(new RegExp(`^[ \\t]{${indent}}`, 'gm'), '');
  }

  return stripIndentation(content);
}

Structure.prototype.clearContent = function(content) {
  content = this.stripUnnecessaryIndents(content)
  content = content.trim();
  return content;
}

Structure.prototype.create = function() {
  // TODO: Read all elements as a class (File, Folder, Script, Structure)
  // TODO: And create a generator that creates all of them recursively.

  fs.readFile(this.template, {encoding: 'utf8'}, (err, context) => {
    const dom = this.parse(context);

    const structureElement = dom.getElementsByTagName('structure')[0];
    if (!structureElement) throw new Error("<structure> element doesn't exists.");

    const varRef = structureElement.getAttribute('variable-ref');
    this.variableRef = varRef !== null ? varRef : this.variableRef;

    const outputDirectory = this.dispatchVariables(structureElement.getAttribute('output'));

    if (shell.test('-e', outputDirectory)) throw new Error(`Directory already exists: ${outputDirectory}`);
    shell.mkdir('-p', outputDirectory);

    const files = dom.getElementsByTagName('file');
    if (files.length === 0) throw new Error("There is no file template in this structure.");

    const scripts = dom.getElementsByTagName('script');
    if (scripts.length === 0) console.log("Script not found.")

    for (let i = 0; i < scripts.length; i += 1) {
      const script = scripts[i];

      // TODO: (optional) Can scripts evaluate only for a specific file?
      this.evaluateScript(script.innerHTML);
    }

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const filename = this.dispatchVariables(file.getAttribute('name'));
      const fileContent = this.dispatchVariables(file.innerHTML);
      const fileContentClean = this.clearContent(fileContent);
      const outputFilePath = `${outputDirectory}/${filename}`;

      if (!shell.test('-e', outputFilePath)) {
        shell.touch(outputFilePath);

        fs.writeFile(`${outputFilePath}`, fileContentClean, () => {
          console.log('\x1b[36mcreated:\x1b[0m', outputFilePath);
        });
      } else {
        throw new Error(`File already exists: ${outputFilePath}`);
      }
    }
  });
}

module.exports = Structure;
