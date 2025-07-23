import { needTransformation } from '@/debug-message/js/JSDebugMessage/transformer/needTransformation';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

const passingCases = [
  {
    name: 'arrow function returning expression',
    lines: ['const double = (x) => x * 2;'],
    selectionLine: 0,
    variableName: 'x',
  },
  {
    name: 'empty function declaration (should need transformation)',
    lines: ['function sayHello(person) {}'],
    selectionLine: 0,
    variableName: 'person',
  },
  {
    name: 'multiline arrow function without block',
    lines: ['const result = (a, b) =>', '  a + b;'],
    selectionLine: 0,
    variableName: 'a',
  },
  {
    name: 'constructor parameter with access modifier (class property)',
    lines: [
      'export class SomeClass {',
      '  constructor(',
      '    protected firstDependency: Segments,',
      '    protected secondDependency: SegmentProviders',
      '  ) {}',
      '}',
    ],
    selectionLine: 2,
    variableName: 'firstDependency',
  },
];

const failingCases = [
  {
    name: 'arrow function with block already',
    lines: ['const double = (x) => { return x * 2; };'],
    selectionLine: 0,
    variableName: 'x',
  },
  {
    name: 'function declaration with block',
    lines: ['function greet(name) { return "Hello " + name; }'],
    selectionLine: 0,
    variableName: 'name',
  },
  {
    name: 'non-function variable declaration',
    lines: ['const result = a + b;'],
    selectionLine: 0,
    variableName: 'result',
  },
  {
    name: 'random comment line',
    lines: ['// nothing to see here'],
    selectionLine: 0,
    variableName: 'nothing',
  },
];

describe('needTransformation', () => {
  for (const doc of passingCases) {
    it(`should require transformation – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = needTransformation(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result).toBe(true);
    });
  }

  for (const doc of failingCases) {
    it(`should NOT require transformation – ${doc.name}`, () => {
      const document = makeTextDocument(doc.lines);
      const result = needTransformation(
        document,
        doc.selectionLine,
        doc.variableName,
      );
      expect(result).toBe(false);
    });
  }
});
