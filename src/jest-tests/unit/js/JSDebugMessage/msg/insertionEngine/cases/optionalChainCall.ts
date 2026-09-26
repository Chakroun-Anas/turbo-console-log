import { InsertionEngineCase } from './types';

// Acorn wraps optional chains in a ChainExpression, which the call-assignment
// line helper does not unwrap: the log lands inside the argument list.
export const optionalChainCallCases: InsertionEngineCase[] = [
  {
    name: 'result of a multi-line optional-chained call is logged after the statement',
    fileExtension: '.ts',
    lines: ['const v = obj?.method?.(', '  arg,', ');', 'use(v);'],
    selectionLine: 0,
    variableName: 'v',
    expectedLine: 3,
  },
];
