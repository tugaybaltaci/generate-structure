class Parser {
  constructor(content, autorun = false) {
    this.content = content;
    this.structure = {};

    if (autorun) this.buildDOM();
  }

  buildDOM() {
    const match = this.content.match(
      /<\/?gs:(root|file|script)((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[\^'">\s]+))?)+\s*|\s*)\/?>/g
    );

    const structure = {
      root: {},
      files: [],
      scripts: []
    };

    match.forEach(tag => {
      if (this.isOpenTag(tag)) {
        const tagName = this.parseTagName(tag).substring(3);

        const tagObj = {
          attributes: this.parseTagAttributes(tag),
          content: this.parseTagContent(tag)
        };

        if (tagName === "root") {
          tagObj.content = structure;
          structure.root = tagObj;
        }
        if (tagName === "file") {
          structure.files.push(tagObj);
        }
        if (tagName === "script") {
          structure.scripts.push(tagObj);
        }
      }
    });

    this.structure = structure;
  }

  isOpenTag(tag) {
    return tag.substring(0, 2) !== "</";
  }

  parseTagName(tag) {
    return tag.replace(/[\<\>]+/g, "").split(" ")[0];
  }

  parseTagAttributes(tag) {
    const attrArray = tag.replace(/[\<\>]+/g, "").split(" ");

    attrArray.shift(); // remove tag name

    const attrObj = attrArray.map(item => {
      const split = item.split("=");

      return {
        [split[0]]: split[1].replace(/[\"\']+/g, "")
      };
    });

    if (attrObj.length < 1) {
      return {};
    }

    return attrObj[0];
  }

  parseTagContent(tag) {
    const name = this.parseTagName(tag);
    const closeTag = `</${name}>`;

    if (name === "structure") return null;

    const startIndex = this.content.indexOf(tag) + tag.length;
    const endIndex =
      this.content.substring(startIndex).indexOf(closeTag) + startIndex;

    return this.content.substring(startIndex, endIndex);
  }
}

module.exports = Parser;
