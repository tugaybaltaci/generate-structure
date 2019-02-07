const shell = require('shelljs');

class File {

  constructor(content) {
    this.name = null;
    this.content = this.purge(content).trim();
    this.size = this.content.length;
  }

  purge(content) {
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
}

module.exports = File;