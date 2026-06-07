import type { TextDocument } from 'vscode';
import type { SyntaxNode } from '@lezer/common';
import type { PythonProgram } from '../../python-parser-utils/types';
import type { PythonLogMessageCheckerResult } from '../pythonLogMessageTypes';
import { getSimpleAssignRhs } from './utils';

const PRIMITIVE_NODE_TYPES = new Set([
  'Number',
  'Float',
  'String',
  'Boolean',
  'None',
]);

function isPrimitiveNode(node: SyntaxNode): boolean {
  if (PRIMITIVE_NODE_TYPES.has(node.type.name)) return true;
  // Unary minus/plus on a number: -42, +3.14
  if (node.type.name === 'UnaryExpression') {
    const operand = node.lastChild;
    return operand?.type.name === 'Number' || operand?.type.name === 'Float';
  }
  return false;
}

export function primitiveAssignmentChecker(
  program: PythonProgram,
  document: TextDocument,
  selectionLine: number,
  selectedVar: string,
): PythonLogMessageCheckerResult {
  const rhs = getSimpleAssignRhs(program, document, selectionLine, selectedVar);
  if (!rhs) return { isChecked: false };
  return { isChecked: isPrimitiveNode(rhs) };
}
