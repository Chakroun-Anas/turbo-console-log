/**
 * PHP AST Node Types
 * Based on php-parser library structure: https://github.com/glayzzle/php-parser
 *
 * These types represent the AST nodes returned by php-parser when parsing PHP code.
 */

export interface Location {
  start: { line: number; column: number; offset: number };
  end: { line: number; column: number; offset: number };
}

export interface PHPNode {
  kind: string;
  loc?: Location;
  leadingComments?: PHPComment[];
  trailingComments?: PHPComment[];
}

export interface PHPComment extends PHPNode {
  kind: 'comment' | 'commentblock' | 'commentline';
  value: string;
}

export interface Program extends PHPNode {
  kind: 'program';
  children: PHPNode[];
  errors?: Error[];
}

export interface Identifier extends PHPNode {
  kind: 'identifier';
  name: string;
}

export interface Variable extends PHPNode {
  kind: 'variable';
  name: string | PHPNode;
  curly?: boolean;
}

export interface Assign extends PHPNode {
  kind: 'assign';
  left: PHPNode;
  right: PHPNode;
  operator: string;
}

export interface AssignRef extends PHPNode {
  kind: 'assignref';
  left: PHPNode;
  right: PHPNode;
}

export interface Literal extends PHPNode {
  kind: 'string' | 'number' | 'boolean' | 'null';
  value: string | number | boolean | null;
  raw?: string;
}

export interface Array extends PHPNode {
  kind: 'array';
  items: Entry[];
  shortForm?: boolean;
}

export interface Entry extends PHPNode {
  kind: 'entry';
  key: PHPNode | null;
  value: PHPNode;
}

export interface Call extends PHPNode {
  kind: 'call';
  what: PHPNode;
  arguments: PHPNode[];
}

export interface Function extends PHPNode {
  kind: 'function';
  name: Identifier | null;
  arguments: Parameter[];
  body: Block;
  isStatic?: boolean;
  byref?: boolean;
  nullable?: boolean;
  type?: PHPNode | null;
}

export interface ArrowFunc extends PHPNode {
  kind: 'arrowfunc';
  arguments: Parameter[];
  body: PHPNode;
  byref?: boolean;
  nullable?: boolean;
  type?: PHPNode | null;
  isStatic?: boolean;
}

export interface Closure extends PHPNode {
  kind: 'closure';
  arguments: Parameter[];
  uses: Variable[];
  body: Block;
  byref?: boolean;
  nullable?: boolean;
  type?: PHPNode | null;
  isStatic?: boolean;
}

export interface Parameter extends PHPNode {
  kind: 'parameter';
  name: string | Identifier; // Can be string or Identifier object
  type?: PHPNode | null;
  value?: PHPNode | null;
  byref?: boolean;
  variadic?: boolean;
  nullable?: boolean;
  readonly?: boolean;
}

export interface Block extends PHPNode {
  kind: 'block';
  children: PHPNode[];
}

export interface Class extends PHPNode {
  kind: 'class';
  name: Identifier | null;
  extends?: Identifier | null;
  implements?: Identifier[];
  body: PHPNode[];
  isAnonymous?: boolean;
  isAbstract?: boolean;
  isFinal?: boolean;
}

export interface Method extends PHPNode {
  kind: 'method';
  name: Identifier;
  arguments: Parameter[];
  body: Block | null;
  visibility?: 'public' | 'protected' | 'private';
  isStatic?: boolean;
  isAbstract?: boolean;
  isFinal?: boolean;
  byref?: boolean;
  nullable?: boolean;
  type?: PHPNode | null;
}

export interface Property extends PHPNode {
  kind: 'property';
  name: string;
  value?: PHPNode | null;
  visibility?: 'public' | 'protected' | 'private';
  isStatic?: boolean;
  nullable?: boolean;
  type?: PHPNode | null;
  readonly?: boolean;
}

export interface PropertyStatement extends PHPNode {
  kind: 'propertystatement';
  properties: Property[];
  visibility?: 'public' | 'protected' | 'private';
  isStatic?: boolean;
}

export interface If extends PHPNode {
  kind: 'if';
  test: PHPNode;
  body: Block;
  alternate?: PHPNode | null;
  shortForm?: boolean;
}

export interface For extends PHPNode {
  kind: 'for';
  init: PHPNode[];
  test: PHPNode[];
  increment: PHPNode[];
  body: Block;
  shortForm?: boolean;
}

export interface Foreach extends PHPNode {
  kind: 'foreach';
  source: PHPNode;
  key?: PHPNode | null;
  value: PHPNode;
  body: Block;
  shortForm?: boolean;
}

export interface While extends PHPNode {
  kind: 'while';
  test: PHPNode;
  body: Block;
  shortForm?: boolean;
}

export interface Return extends PHPNode {
  kind: 'return';
  expr: PHPNode | null;
}

export interface Namespace extends PHPNode {
  kind: 'namespace';
  name: string | null;
  children: PHPNode[];
  withBrackets?: boolean;
}

export interface UseGroup extends PHPNode {
  kind: 'usegroup';
  items: UseItem[];
  type?: 'function' | 'const' | null;
}

export interface UseItem extends PHPNode {
  kind: 'useitem';
  name: string;
  alias?: string | null;
}

export interface Trait extends PHPNode {
  kind: 'trait';
  name: Identifier;
  body: PHPNode[];
}

export interface TraitUse extends PHPNode {
  kind: 'traituse';
  traits: Identifier[];
  adaptations?: PHPNode[];
}

export interface Bin extends PHPNode {
  kind: 'bin';
  type: string;
  left: PHPNode;
  right: PHPNode;
}

export interface Unary extends PHPNode {
  kind: 'unary';
  type: string;
  what: PHPNode;
}

export interface PropertyLookup extends PHPNode {
  kind: 'propertylookup';
  what: PHPNode;
  offset: PHPNode;
}

export interface StaticLookup extends PHPNode {
  kind: 'staticlookup';
  what: PHPNode;
  offset: PHPNode;
}

export interface OffsetLookup extends PHPNode {
  kind: 'offsetlookup';
  what: PHPNode;
  offset: PHPNode | null;
}

export interface Ternary extends PHPNode {
  kind: 'retif';
  test: PHPNode;
  trueExpr: PHPNode | null;
  falseExpr: PHPNode;
}

export interface Echo extends PHPNode {
  kind: 'echo';
  expressions: PHPNode[];
  shortForm?: boolean;
}

export interface Print extends PHPNode {
  kind: 'print';
  arguments: PHPNode[];
}

export interface ExpressionStatement extends PHPNode {
  kind: 'expressionstatement';
  expression: PHPNode;
}

export interface Encapsed extends PHPNode {
  kind: 'encapsed';
  value: EncapsedPart[];
  raw: string;
  type: string;
}

export interface EncapsedPart extends PHPNode {
  kind: 'encapsedpart';
  expression: PHPNode;
  syntax: string | null;
  curly: boolean;
}

// Union type for all possible PHP nodes
export type AnyPHPNode =
  | Program
  | Identifier
  | Variable
  | Assign
  | AssignRef
  | Literal
  | Array
  | Entry
  | Call
  | Function
  | ArrowFunc
  | Closure
  | Parameter
  | Block
  | Class
  | Method
  | Property
  | PropertyStatement
  | If
  | For
  | Foreach
  | While
  | Return
  | Namespace
  | UseGroup
  | UseItem
  | Trait
  | TraitUse
  | Bin
  | Unary
  | PropertyLookup
  | StaticLookup
  | OffsetLookup
  | Ternary
  | Echo
  | Print
  | ExpressionStatement
  | Encapsed
  | EncapsedPart
  | PHPNode;
