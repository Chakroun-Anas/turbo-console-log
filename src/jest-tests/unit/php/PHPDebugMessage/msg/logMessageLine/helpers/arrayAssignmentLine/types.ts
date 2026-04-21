export type ArrayAssignmentLineTestCase = {
  name: string;
  fileExtension: string;
  lines: string[];
  selectionLine: number;
  variableName: string;
  expectedLine: number;
};
