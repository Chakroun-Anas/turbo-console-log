import { binaryExpressionLine } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine/helpers/';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import documents from './cases';

describe('binaryExpressionLine – insertion line after binary expression', () => {
  for (const documnet of documents) {
    it(`returns correct insertion line – ${documnet.name}`, () => {
      const doc = makeTextDocument(documnet.lines);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ast = parseCode(doc.getText(), (documnet as any).fileExtension)!;
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
