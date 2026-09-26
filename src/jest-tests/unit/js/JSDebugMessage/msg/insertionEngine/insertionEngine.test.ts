import { LogContextMetadata } from '@/entities';
import { parseCode } from '@/debug-message/js/JSDebugMessage/msg/acorn-utils';
import { logMessage } from '@/debug-message/js/JSDebugMessage/msg/logMessage';
import { line } from '@/debug-message/js/JSDebugMessage/msg/logMessageLine';
import { needTransformation } from '@/debug-message/js/JSDebugMessage/msg/transformer';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';
import insertionEngineCases from './cases';

// End-to-end table for the insertion engine. Per-helper suites test one checker
// or one line helper in isolation; several engine bugs only show up when type
// detection, line resolution and the transformer are chained the way msg() does.
describe('insertion engine (end to end)', () => {
  for (const testCase of insertionEngineCases) {
    // `knownBroken` cases pin behaviour the engine does not honour yet.
    const runner = testCase.knownBroken ? it.failing : it;

    runner(testCase.name, () => {
      const document = makeTextDocument(testCase.lines);
      const ast = parseCode(
        document.getText(),
        testCase.fileExtension,
        testCase.selectionLine,
      );

      const logMsg = logMessage(
        ast,
        document,
        testCase.selectionLine,
        testCase.variableName,
      );
      const insertionLine = line(
        ast,
        document,
        testCase.selectionLine,
        testCase.variableName,
        logMsg,
      );
      const transformation = needTransformation(
        ast,
        document,
        testCase.selectionLine,
        testCase.variableName,
      );
      const deepObjectPath = (logMsg.metadata as LogContextMetadata | undefined)
        ?.deepObjectPath;

      expect(transformation).toBe(testCase.expectsTransformation ?? false);
      if (testCase.expectedLogMessageType) {
        expect(logMsg.logMessageType).toBe(testCase.expectedLogMessageType);
      }
      if (testCase.expectedDeepObjectPath !== undefined) {
        expect(deepObjectPath).toBe(testCase.expectedDeepObjectPath);
      }
      if (transformation) return;

      expect(insertionLine).toBe(testCase.expectedLine);

      // The inserted log must leave the file parseable: a log dropped inside
      // an object literal or an argument list is the worst failure mode.
      const loggedExpression = deepObjectPath || testCase.variableName;
      const linesWithLog = [
        ...testCase.lines.slice(0, insertionLine),
        `console.log(${loggedExpression});`,
        ...testCase.lines.slice(insertionLine),
      ];
      expect(() =>
        parseCode(
          linesWithLog.join('\n'),
          testCase.fileExtension,
          insertionLine,
        ),
      ).not.toThrow();
    });
  }
});
