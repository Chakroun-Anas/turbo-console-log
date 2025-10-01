import * as acorn from 'acorn';

export type AcornNode = acorn.Node;

export interface Literal extends AcornNode {
  type: 'Literal';
  value: string | number | boolean | null;
  raw?: string;
}

export interface Identifier extends AcornNode {
  type: 'Identifier';
  name: string;
}

export interface ThisExpression extends AcornNode {
  type: 'ThisExpression';
}

export interface MemberExpression extends AcornNode {
  type: 'MemberExpression';
  object: AcornNode;
  property: AcornNode;
  computed: boolean;
}

export interface VariableDeclarator extends AcornNode {
  type: 'VariableDeclarator';
  id: AcornNode;
  init: AcornNode | null;
}

export interface VariableDeclaration extends AcornNode {
  type: 'VariableDeclaration';
  declarations: VariableDeclarator[];
  kind: 'var' | 'let' | 'const';
}

export interface ObjectPattern extends AcornNode {
  type: 'ObjectPattern';
  properties: Property[];
}

export interface ArrayPattern extends AcornNode {
  type: 'ArrayPattern';
  elements: (AcornNode | null)[];
}

export interface Property extends AcornNode {
  type: 'Property';
  key: AcornNode;
  value: AcornNode;
  kind: 'init' | 'get' | 'set';
  method: boolean;
  shorthand: boolean;
  computed: boolean;
}

export interface TemplateLiteral extends AcornNode {
  type: 'TemplateLiteral';
  quasis: AcornNode[];
  expressions: AcornNode[];
}

export interface TaggedTemplateExpression extends AcornNode {
  type: 'TaggedTemplateExpression';
  tag: AcornNode;
  quasi: TemplateLiteral;
}

export interface ArrayExpression extends AcornNode {
  type: 'ArrayExpression';
  elements: (AcornNode | null)[];
}

export interface ObjectExpression extends AcornNode {
  type: 'ObjectExpression';
  properties: Property[];
}

export interface CallExpression extends AcornNode {
  type: 'CallExpression';
  callee: AcornNode;
  arguments: AcornNode[];
}

export interface FunctionDeclaration extends AcornNode {
  type: 'FunctionDeclaration';
  id: Identifier | null;
  params: AcornNode[];
  body: AcornNode;
}

export interface FunctionExpression extends AcornNode {
  type: 'FunctionExpression';
  id: Identifier | null;
  params: AcornNode[];
  body: AcornNode;
}

export interface ArrowFunctionExpression extends AcornNode {
  type: 'ArrowFunctionExpression';
  params: AcornNode[];
  body: AcornNode;
  expression: boolean;
}

export interface BinaryExpression extends AcornNode {
  type: 'BinaryExpression';
  operator: string;
  left: AcornNode;
  right: AcornNode;
}

export interface LogicalExpression extends AcornNode {
  type: 'LogicalExpression';
  operator: '||' | '&&' | '??';
  left: AcornNode;
  right: AcornNode;
}

export interface ConditionalExpression extends AcornNode {
  type: 'ConditionalExpression';
  test: AcornNode;
  consequent: AcornNode;
  alternate: AcornNode;
}

export interface ReturnStatement extends AcornNode {
  type: 'ReturnStatement';
  argument: AcornNode | null;
}

export interface BlockStatement extends AcornNode {
  type: 'BlockStatement';
  body: AcornNode[];
}

export interface ExpressionStatement extends AcornNode {
  type: 'ExpressionStatement';
  expression: AcornNode;
}

export interface AssignmentExpression extends AcornNode {
  type: 'AssignmentExpression';
  operator: string;
  left: AcornNode;
  right: AcornNode;
}

export interface ParenthesizedExpression extends AcornNode {
  type: 'ParenthesizedExpression';
  expression: AcornNode;
}

export interface TSAsExpression extends AcornNode {
  type: 'TSAsExpression';
  expression: AcornNode;
}

export interface TSTypeAssertion extends AcornNode {
  type: 'TSTypeAssertion';
  expression: AcornNode;
}

export interface AwaitExpression extends AcornNode {
  type: 'AwaitExpression';
  argument: AcornNode;
}

export interface RestElement extends AcornNode {
  type: 'RestElement';
  argument: AcornNode;
}

export interface AssignmentPattern extends AcornNode {
  type: 'AssignmentPattern';
  left: AcornNode;
  right: AcornNode;
}

export interface ChainExpression extends AcornNode {
  type: 'ChainExpression';
  expression: AcornNode;
}

export interface TSParameterProperty extends AcornNode {
  type: 'TSParameterProperty';
  parameter?: AcornNode;
  accessibility?: 'public' | 'private' | 'protected';
  readonly?: boolean;
}

export interface MethodDefinition extends AcornNode {
  type: 'MethodDefinition';
  key: AcornNode;
  value: AcornNode; // FunctionExpression
  kind: 'constructor' | 'method' | 'get' | 'set';
  static: boolean;
}

export interface ClassMethod extends AcornNode {
  type: 'ClassMethod';
  key: AcornNode;
  params: AcornNode[];
  body: AcornNode;
  kind: 'constructor' | 'method' | 'get' | 'set';
  static: boolean;
}
