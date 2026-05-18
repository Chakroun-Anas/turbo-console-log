/**
 * Shared test case types for PHP log message helpers.
 * These types are used across all checker and line helper tests.
 */

/**
 * Base type for checker test cases.
 * Used by: primitiveAssignmentChecker, arrayAssignmentChecker, functionCallAssignmentChecker,
 * propertyAccessAssignmentChecker, functionParameterChecker
 */
export type CheckerTestCase = {
  name: string;
  fileExtension: string;
  lines: string[];
  selectionLine: number;
  variableName: string;
};

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
