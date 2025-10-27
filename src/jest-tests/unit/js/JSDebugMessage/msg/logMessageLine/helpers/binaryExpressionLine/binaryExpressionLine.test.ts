import { binaryExpressionLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers/';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import documents from './cases';

describe('binaryExpressionLine – insertion line after binary expression', () => {
  for (const documnet of documents) {
    it(`returns correct insertion line – ${documnet.name}`, () => {
      const doc = makeTextDocument(documnet.lines);
      const ast = parseCode(
        doc.getText(),
        documnet.fileExtension,
        documnet.selectionLine,
      );
      const insertionLine = binaryExpressionLine(
        ast,
        doc,
        documnet.selectionLine,
        documnet.variableName,
      );
      expect(insertionLine).toBe(documnet.expectedLine);
    });
  }
});
