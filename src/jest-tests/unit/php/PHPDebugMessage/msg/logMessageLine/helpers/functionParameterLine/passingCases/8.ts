import type { FunctionParameterLineTestCase } from '../types';

export default {
  name: 'method with multi-line parameters and default values',
  fileExtension: '.php',
  lines: [
    '<?php',
    'class Service {',
    '  public function configure(',
    '    $host = "localhost",',
    '    $port = 3306,',
    '    $username = "root",',
    '    $password = ""',
    '  ) {',
    '    return $port;',
    '  }',
    '}',
  ],
  selectionLine: 2,
  variableName: '$port',
  expectedLine: 8,
} satisfies FunctionParameterLineTestCase;
