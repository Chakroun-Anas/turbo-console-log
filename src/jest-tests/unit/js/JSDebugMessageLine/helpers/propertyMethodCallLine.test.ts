import { propertyMethodCallLine } from '@/debug-message/js/JSDebugMessageLine/helpers/propertyMethodCallLine';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

describe('propertyMethodCallLine', () => {
  const testCases = [
    {
      name: 'should return the next line after this.subscriptions.add(...)',
      lines: [
        'function myFunc() {',
        '  this.subscriptions.add(this.someService.someVar.subscribe((next) => {',
        '    this.mode = next;',
        '  }));',
        '}',
      ],
      selectionLine: 1,
      selectedText: 'this.subscriptions',
      expectedLine: 4,
    },
    {
      name: 'should return the next line after user.session.invalidate()',
      lines: ['function logout() {', '  user.session.invalidate();', '}'],
      selectionLine: 1,
      selectedText: 'user.session',
      expectedLine: 2,
    },
  ];

  for (const test of testCases) {
    it(test.name, () => {
      const doc = makeTextDocument(test.lines);
      const line = propertyMethodCallLine(
        doc,
        test.selectionLine,
        test.selectedText,
      );
      expect(line).toBe(test.expectedLine);
    });
  }
});
