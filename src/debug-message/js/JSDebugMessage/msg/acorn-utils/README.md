# Acorn Utilities

This module provides shared TypeScript types, type guards, and utilities for working with Acorn AST (Abstract Syntax Tree) across different checkers in the Turbo Console Log extension.

## Purpose

As part of migrating from TypeScript Compiler to Acorn (a lighter alternative), this module centralizes common Acorn-related functionality to:

1. **Reduce code duplication** - Shared types and utilities used across multiple checkers
2. **Strong typing** - Comprehensive TypeScript type definitions for Acorn nodes
3. **Type safety** - Type guard functions for safe node type checking
4. **Consistency** - Standardized AST parsing and traversal across the codebase

## Module Structure

### `types.ts`

Comprehensive TypeScript type definitions for Acorn AST nodes:

- `AcornNode` - Base node type
- `Literal`, `Identifier`, `MemberExpression` - Expression types
- `VariableDeclaration`, `VariableDeclarator` - Declaration types
- `ObjectPattern`, `ArrayPattern` - Destructuring patterns
- `FunctionDeclaration`, `FunctionExpression`, `ArrowFunctionExpression` - Function types
- `BinaryExpression`, `ConditionalExpression` - Operator types
- And many more...

### `guards.ts`

Type guard functions for safe type checking:

- `isLiteral(node)` - Check if node is a literal value
- `isIdentifier(node)` - Check if node is an identifier
- `isMemberExpression(node)` - Check if node is a member expression
- `isVariableDeclaration(node)` - Check if node is a variable declaration
- And more for each node type...

### `walk.ts`

AST traversal utility:

- `walk(node, visitor)` - Recursively traverse AST nodes
  - Visitor can return `true` to stop traversal early
  - Automatically handles arrays and nested nodes

### `parser.ts`

Code parsing utility:

- `parseCode(sourceCode)` - Parse JavaScript/TypeScript code into Acorn AST
  - Returns parsed AST or `null` if parsing fails
  - Configured for latest ECMAScript with module support

### `index.ts`

Main export file - re-exports all types, guards, and utilities for easy importing.

## Usage

### Basic Example

```typescript
import {
  type AcornNode,
  isVariableDeclaration,
  isIdentifier,
  walk,
  parseCode,
} from '../../acorn-utils';

function myChecker(document: TextDocument, selectionLine: number): boolean {
  const sourceCode = document.getText();
  const ast = parseCode(sourceCode);

  if (!ast) {
    return false;
  }

  let found = false;

  walk(ast, (node: AcornNode) => {
    if (found) return true; // Stop traversal

    if (isVariableDeclaration(node)) {
      // TypeScript now knows node is VariableDeclaration
      for (const decl of node.declarations) {
        if (isIdentifier(decl.id)) {
          // TypeScript knows decl.id is Identifier
          console.log(decl.id.name);
          found = true;
          return true;
        }
      }
    }
  });

  return found;
}
```

### Type Guards Benefits

Type guards provide TypeScript type narrowing:

```typescript
function checkNode(node: AcornNode) {
  // node.name // ❌ Error: 'name' doesn't exist on AcornNode

  if (isIdentifier(node)) {
    node.name; // ✅ OK: TypeScript knows it's an Identifier
  }

  if (isMemberExpression(node)) {
    node.object; // ✅ OK: Has object property
    node.property; // ✅ OK: Has property property
    node.computed; // ✅ OK: Has computed property
  }
}
```

## Migration Guide

When migrating a checker from TypeScript Compiler to Acorn:

1. **Replace TypeScript imports** with acorn-utils imports
2. **Remove local type definitions** - use shared types from `types.ts`
3. **Use type guards** instead of TypeScript SyntaxKind checks
4. **Use `parseCode()`** instead of `ts.createSourceFile()`
5. **Use `walk()`** instead of `ts.forEachChild()`

### Before (TypeScript Compiler):

```typescript
import ts from 'typescript';

function checker(sourceFile: ts.SourceFile, ...): boolean {
  let found = false;

  ts.forEachChild(sourceFile, function visit(node: ts.Node) {
    if (ts.isVariableStatement(node)) {
      // ...
    }
    ts.forEachChild(node, visit);
  });

  return found;
}
```

### After (Acorn):

```typescript
import { type AcornNode, isVariableDeclaration, walk, parseCode } from '../../acorn-utils';

function checker(document: TextDocument, ...): boolean {
  const ast = parseCode(document.getText());
  if (!ast) return false;

  let found = false;

  walk(ast, (node: AcornNode) => {
    if (isVariableDeclaration(node)) {
      // ...
    }
  });

  return found;
}
```

## Adding New Types

If you need additional Acorn node types:

1. Add the interface to `types.ts`
2. Add the type guard to `guards.ts`
3. Export both from `index.ts`

Example:

```typescript
// types.ts
export interface NewNodeType extends AcornNode {
  type: 'NewNodeType';
  customProperty: string;
}

// guards.ts
export function isNewNodeType(node: AcornNode): node is NewNodeType {
  return node.type === 'NewNodeType';
}

// index.ts
export type { NewNodeType } from './types';
export { isNewNodeType } from './guards';
```

## Best Practices

1. **Always use type guards** - Never cast nodes directly
2. **Handle parsing errors** - `parseCode()` throws errors on parsing failures, wrap in try-catch
3. **Handle location data** - Check `node.loc` exists before using
4. **Early return in walk** - Return `true` from visitor to stop traversal
5. **No `any` or `unknown`** - Use proper types from this module
