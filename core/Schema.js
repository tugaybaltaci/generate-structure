const fs = require('fs');
const DomParser = require('dom-parser');
const shell = require('shelljs');
const parser = new DomParser();

function Schema(template, name) {

  //if (!fs.exists(template)) throw new Error("Given file not found");
  this.template = template;
  this.variables = { name };
}

Schema.prototype.parse = function(markup) {
  const dom = parser.parseFromString(markup);
  return dom;
};

Schema.prototype.evaluateScript = function(script) {

  const Schema = {
    getVariable: (name) => {
      return this.variables[name];
    },
    passVariable: (name, value) => {
      this.variables[name] = value;
    }
  }

  eval(script);
};

Schema.prototype.dispatchVariables =  function (string) {
  for(let variable in this.variables) {
    // TODO: Make variable template for prevent conflicts any language.

    string = string.replace(new RegExp(`%${variable}%`, 'gi'), this.variables[variable]);
  }
  return string;
}

Schema.prototype.createAll = function() {
  fs.readFile(this.template, {encoding: 'utf8'}, (err, context) => {
    const dom = this.parse(context);

    const schemaElement = dom.getElementsByTagName('schema')[0];
    if (!schemaElement) throw new Error("<schema> element doesn't exists.");

    const output = this.dispatchVariables(schemaElement.getAttribute('output'));

    // TODO check if directory exists
    shell.mkdir('-p', output);

    const files = dom.getElementsByTagName('file');
    if (files.length === 0) throw new Error("There is no file template in this schema.");

    const scripts = dom.getElementsByTagName('script');
    if (scripts.length === 0) console.log("Script not found.")

    for (let i = 0; i < scripts.length; i += 1) {
      const script = scripts[i];

      // TODO: (optional) Scripts can evaluate only for a specific file
      this.evaluateScript(script.innerHTML);
    }

    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      const filename = this.dispatchVariables(file.getAttribute('name'));
      const fileContext = this.dispatchVariables(file.innerHTML);

      // TODO: check if file exists than ask for modifiy
      shell.touch(`${output}/${filename}`);

      // TODO: Fix tab issue
      fs.writeFile(`${output}/${filename}`, fileContext);
    }
  });
}

module.exports = Schema;
