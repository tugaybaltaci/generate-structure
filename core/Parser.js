class Parser {
  constructor(content, autorun = false) {
    this.content = content;
    this.root = {};

    if (autorun) this.buildDOM();
  }

  buildDOM() {
    const match = this.content.match(
      /<\/?(file|structure|script)((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[\^'">\s]+))?)+\s*|\s*)\/?>/g
    );

    const root = {
      structure: {},
      files: [],
      scripts: []
    };

    match.forEach(tag => {
      if (this.isOpenTag(tag)) {
        const tagName = this.parseTagName(tag);
        const tagObj = {
          attributes: this.parseTagAttributes(tag),
          content: this.parseTagContent(tag)
        };

        if (tagName === "structure") {
          tagObj.content = root;
          root.structure = tagObj;
        }
        if (tagName === "file") {
          root.files.push(tagObj);
        }
        if (tagName === "script") {
          if (
            tagObj.attributes.type &&
            tagObj.attributes.type === "gs/javascript"
          ) {
            root.scripts.push(tagObj);
          }
        }
      }
    });

    this.root = root;

    return root;
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
