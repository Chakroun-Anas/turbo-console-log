import type { FunctionParameterCheckerTestCase } from '../types';

export default {
  name: 'function with complex type hints spanning multiple lines',
  fileExtension: '.php',
  lines: [
    '<?php',
    'function handleRequest(',
    '  Request $request,',
    '  ResponseInterface $response,',
    '  LoggerInterface $logger,',
    '  array $config = [],',
    '  callable $errorHandler = null',
    '): Response {',
    '  return $logger;',
    '}',
  ],
  selectionLine: 1,
  variableName: '$logger',
} satisfies FunctionParameterCheckerTestCase;
