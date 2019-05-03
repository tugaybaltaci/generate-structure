# Structure Generator

Structure generator helps you to create multiple code templates that using continuously in your projects.

Note: This repository still work in progress.

## Usage

Firstly, you have to create a template file for define your code templates.

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
      
      </p>
    </div>
  </file>
```

### Scripting

Scripts are executes before creating files. It is executes once and set all variables instead of execute for each files.

`Structure` class has 3 properties. 
- `name`: Refers defined file name 
- `getVariable`: Brings the variable by given name
- `setVariable`: Defines a variable according to given key and value

```html
  <script>
    // You can reach `Structure` object in that script tag and pass new variables into templates. These variables can use in everywhere of template including filename
    const {name, getVariable, setVariable} = Structure;
    const capName = name.split('-').map(x => x.charAt(0).toUpperCase() + x.slice(1)).join('');

    // Now you can use this variable in your
    // templates or filenames.
    setVariable('capName', capName);
  </script>
```
