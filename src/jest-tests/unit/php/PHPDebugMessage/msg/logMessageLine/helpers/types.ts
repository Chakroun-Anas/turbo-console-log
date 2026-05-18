/**
 * Shared test case types for PHP log message line helpers.
 * These types are used across all line helper tests.
 */

/**
 * Base type for line helper test cases.
 * Used by: primitiveAssignmentLine, arrayAssignmentLine, functionCallAssignmentLine,
 * propertyAccessAssignmentLine, functionParameterLine
 */
export type LineTestCase = {
  name: string;
  fileExtension: string;
  lines: string[];
  selectionLine: number;
  variableName: string;
  expectedLine: number;
};
