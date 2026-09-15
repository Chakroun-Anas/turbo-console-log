import { InsertionEngineCase } from './types';

// Today the log lands before the `} else if` line, i.e. inside the previous
// branch, where it only runs when that other branch is taken. Logging before
// the whole chain is not safe either: an else-if condition often relies on the
// earlier branches having ruled something out (`if (!user) … else if
// (user.role)`), so the log goes at the top of the else-if body.
export const elseIfConditionCases: InsertionEngineCase[] = [
  {
    name: 'else-if condition member is logged inside the else-if body',
    fileExtension: '.ts',
    lines: ['if (a) {', '  x();', '} else if (b.value) {', '  y();', '}'],
    selectionLine: 2,
    variableName: 'b.value',
    expectedLine: 3,
  },
];
