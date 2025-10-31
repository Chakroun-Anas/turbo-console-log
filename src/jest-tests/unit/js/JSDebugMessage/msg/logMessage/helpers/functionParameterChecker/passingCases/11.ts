// Multi-line arrow function with nested default function parameter
export default {
  name: 'arrow function with multi-line parameters and nested default',
  fileExtension: '.ts',
  lines: [
    '(',
    '  firstParam: any,',
    '  secondParam: any = (',
    '    someParam1: any,',
    '    someParam2: any,',
    '    someParam3: any,',
    '    someParam4: any,',
    '  ) => {',
    '    return 0;',
    '  },',
    '  thirdParam: any,',
    '  fourthParam: any,',
    ') => {',
    '  return 0;',
    '};',
  ],
  selectionLine: 1, // Line with "firstParam: any," (0-indexed, so line 2 in 1-indexed = line 1 in 0-indexed)
  variableName: 'firstParam',
};
