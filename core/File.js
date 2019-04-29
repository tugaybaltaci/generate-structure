class File {
  constructor(content) {
    this.name = null;
    this.content = this.purge(content).trim();
    this.size = this.content.length;
  }

  save(name) {
    this.name = name;
  }

  // eslint-disable-next-line class-methods-use-this
  purge(content) {
    const minIndentation = str => {
      const match = str.match(/^[ \t]*(?=\S)/gm);
      if (!match) return 0;

      return Math.min(...match.map(x => x.length));
    };

    const stripIndentation = str => {
      const indent = minIndentation(str);
      if (indent === 0) {
        return str;
      }
      return str.replace(new RegExp(`^[ \\t]{${indent}}`, 'gm'), '');
    };

    return stripIndentation(content);
  }
}

module.exports = File;
