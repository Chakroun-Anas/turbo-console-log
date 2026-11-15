import { STATEMENT_TYPES } from '../../acorn-utils/guards';

export const STATEMENT_LIKE_TYPES = new Set([
  ...STATEMENT_TYPES,
  'FunctionDeclaration',
  'ClassDeclaration',
  'TryStatement',
  'PropertyDefinition',
  'MethodDefinition',
]);

export const BLOCK_TYPES = new Set([
  'BlockStatement',
  'StaticBlock',
  'TSModuleBlock',
]);
