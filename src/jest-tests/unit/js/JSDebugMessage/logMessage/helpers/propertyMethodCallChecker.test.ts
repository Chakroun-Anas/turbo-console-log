import { propertyMethodCallChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/propertyMethodCallChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

describe('propertyMethodCallChecker', () => {
  const testCases = [
    {
      name: 'should detect method call on property access – this.subscriptions.add()',
      lines: [
        'function myFunc() {',
        '  this.subscriptions.add(this.someService.someVar.subscribe((next) => {',
        '    this.mode = next;',
        '  }));',
        '}',
      ],
      selectionLine: 1,
      selectedText: 'this.subscriptions',
      expected: true,
    },
    {
      name: 'should detect method call on nested object – user.session.invalidate()',
      lines: ['function logout() {', '  user.session.invalidate();', '}'],
      selectionLine: 1,
      selectedText: 'user.session',
      expected: true,
    },
    {
      name: 'should NOT match standalone property access – this.foo',
      lines: ['function setup() {', '  const x = this.foo;', '}'],
      selectionLine: 1,
      selectedText: 'this.foo',
      expected: false,
    },
    {
      name: 'should NOT match direct function call – someFn()',
      lines: ['function run() {', '  someFn();', '}'],
      selectionLine: 1,
      selectedText: 'someFn',
      expected: false,
    },
  ];

  for (const test of testCases) {
    it(test.name, () => {
      const doc = makeTextDocument(test.lines);
      const result = propertyMethodCallChecker(
        doc,
        test.selectionLine,
        test.selectedText,
      );
      expect(result.isChecked).toBe(test.expected);
    });
  }
});
