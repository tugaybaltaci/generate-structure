# Structure Generator

Structure generator helps you create multiple code templates that using continuously in your projects.

Note: This repository is still work in progress.

## Install

```
npm install generate-structure
--
yarn add generate-structure
```

## Usage
Firstly, you have to create a template file to define your code templates.

### Structure

`structure` tag accept single attribute for now.
It is `out` attribute which is define root folder of structure. 

```html
<structure out="test/%name%-component">
  ... files, scripts
</structure>
```

### Files

Either `file` tag accept single attribute which is `name`.  `name` attribute defines file name and you can use variables in.

```html
  <file name="%name%.js">
    function %name%Func() {
      return "test ok"
    }
  </file>

  <file name="%name%.css">
    /* This is a css file */
    .%name%Class {
      /* your css */
    }
  </file>

  <file name="%name%.html">
    <!-- This is an html file. I hope that will be included in output. -->
    <div class="%name%Class" onload="%name%Func();">
      <h1>Hello world.</h1>
      <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ab mollitia quis voluptatum molestiae, animi molestias aut. Cum dignissimos maxime minima tempora. Asperiores dolor ipsam modi aliquid ea nobis blanditiis sint?</p>
      <img src="%name%.png" alt="%name%">
      <p>
        Eius excepturi itaque distinctio explicabo necessitatibus nemo impedit dicta amet, doloremque provident adipisci delectus porro eligendi architecto laudantium enim officiis? Natus quae ducimus dolores necessitatibus excepturi quam asperiores saepe odit?
      </p>
    </div>
  </file>
```

### Scripting

StructureGenerator has a simple API that you can create or modify variables.

Scripts are executed before creating files. It executes once and set all variables instead of executing for each file.

`StructureGenerator` object has 3 properties.
| | | |
|-|-|-|
| `name` | Refers defined file name
| `getVariable` | Brings the variable by given name
| `setVariable` | Defines a variable according to given key and value

---
```html
  <script>
    // You can reach `StructureGenerator` object in that `script` tag and pass new variables into templates.
    // These variables can use in everywhere of template including filename.
    const {name, getVariable, setVariable} = StructureGenerator;
    const capName = name.split('-').map(x => x.charAt(0).toUpperCase() + x.slice(1)).join('');

    // Now you can use this variable in your
    // templates or filenames.
    setVariable('capName', capName);
  </script>
```

### Generating templates

```js
const generator = new GenerateStructure("test", "example-templates/test.html");
generator.run();
```