import { performTransformation } from '@/debug-message/js/JSDebugMessage/msg/transformer/performTransformation';
import { makeTextDocument } from '@/jest-tests/mocks/helpers';

const options = {
  addSemicolonInTheEnd: true,
  tabSize: 2,
};

const testCases = [
  {
    name: 'arrow function with implicit return',
    lines: ['const double = (x) => x * 2;'],
    selectedVar: 'x',
    line: 0,
    debuggingMsg: 'console.log("DEBUG")',
    expected: `const double = (x) => {
    console.log("DEBUG");
    return x * 2;
};`,
  },
  {
    name: 'empty function declaration',
    lines: ['function greet(name) {}'],
    selectedVar: 'name',
    line: 0,
    debuggingMsg: 'console.log("DEBUG");',
    expected: `function greet(name) {
    console.log("DEBUG");
}`,
  },
];

describe('performTransformation', () => {
  for (const testCase of testCases) {
    it(`should transform code correctly – ${testCase.name}`, () => {
      const doc = makeTextDocument(testCase.lines);
      const result = performTransformation(
        doc,
        testCase.line,
        testCase.selectedVar,
        testCase.debuggingMsg,
        options,
      ).trim();
      expect(result).toBe(testCase.expected);
    });
  }
});
