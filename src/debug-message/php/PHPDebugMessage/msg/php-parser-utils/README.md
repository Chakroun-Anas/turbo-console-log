/\*\*

- README: PHP Parser Utils
-
- This directory contains utilities for parsing and traversing PHP code using php-parser.
-
- ## Overview
-
- The php-parser library (https://github.com/glayzzle/php-parser) is used to parse PHP code
- into an Abstract Syntax Tree (AST) that we can analyze to determine where to insert
- debug log statements.
-
- ## Key Files
-
- - **types.ts**: TypeScript definitions for PHP AST nodes
- - **parseCode.ts**: Main parsing function that converts PHP source to AST
- - **guards.ts**: Type guard functions to safely check node types
- - **walk.ts**: AST traversal utilities to visit nodes in the tree
-
- ## Usage Example
-
- ```typescript

  ```
- import { parseCode, walk, isVariable, isAssign } from './php-parser-utils';
-
- const phpCode = `<?php
- $user = "John";
- echo $user;
- ?>`;
-
- const ast = parseCode(phpCode);
-
- walk(ast, (node) => {
- if (isAssign(node)) {
-     console.log('Found assignment:', node);
- }
- });
- ```

  ```
-
- ## PHP Parser Configuration
-
- The parser is configured to:
- - Support PHP 7.x and 8.x syntax
- - Extract documentation comments
- - Include source positions (line/column numbers)
- - Parse all tokens for complete analysis
-
- ## Node Kinds
-
- Common PHP node kinds we'll encounter:
- - `program`: Root node
- - `variable`: PHP variables ($varName)
- - `assign`: Variable assignments
- - `call`: Function/method calls
- - `function`, `method`, `closure`, `arrowfunc`: Function declarations
- - `class`, `trait`: Class/trait definitions
- - `if`, `for`, `foreach`, `while`: Control structures
- - `array`: Array literals
- - `propertylookup`: Object property access ($obj->prop)
- - `staticlookup`: Static property access (Class::$prop)
- - `offsetlookup`: Array access ($arr[0])
-
- ## Installation Note
-
- Before this module works, we need to install php-parser:
- ```bash

  ```
- npm install php-parser
- npm install --save-dev @types/php-parser
- ```
  */
  ```
