import type { FunctionParameterCheckerTestCase } from '../types';

export default {
  name: 'closure with multi-line parameters',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$processor = function(',
    '  $data,',
    '  $format,',
    '  $options = []',
    ') {',
    '  return $format;',
    '};',
  ],
  selectionLine: 1,
  variableName: '$format',
} satisfies FunctionParameterCheckerTestCase;
