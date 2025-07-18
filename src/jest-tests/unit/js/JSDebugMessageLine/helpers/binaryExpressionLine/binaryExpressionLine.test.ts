import { binaryExpressionLine } from '@/debug-message/js/JSDebugMessage/logMessageLine/helpers/binaryExpressionLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import documents from './cases';

describe('binaryExpressionLine – insertion line after binary expression', () => {
  for (const documnet of documents) {
    const doc = makeTextDocument(documnet.lines);
    const insertionLine = binaryExpressionLine(
      doc,
      documnet.selectionLine,
      documnet.variableName,
    );

    it(`returns correct insertion line – ${documnet.name}`, () => {
      expect(insertionLine).toBe(documnet.expectedLine);
    });
  }
});
