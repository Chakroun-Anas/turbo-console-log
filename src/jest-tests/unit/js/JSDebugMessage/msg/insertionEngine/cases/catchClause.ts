import { InsertionEngineCase } from './types';

// A catch parameter only exists inside its handler: logging it anywhere else
// references an undeclared binding.
export const catchClauseCases: InsertionEngineCase[] = [
  {
    name: 'catch parameter is logged at the top of the handler',
    fileExtension: '.ts',
    lines: ['try {', '  run();', '} catch (err) {', '  handle(err);', '}'],
    selectionLine: 2,
    variableName: 'err',
    expectedLine: 3,
  },
  {
    name: 'destructured catch parameter is logged at the top of the handler',
    fileExtension: '.ts',
    lines: [
      'try {',
      '  run();',
      '} catch ({ message }) {',
      '  handle(message);',
      '}',
    ],
    selectionLine: 2,
    variableName: 'message',
    expectedLine: 3,
  },
];
