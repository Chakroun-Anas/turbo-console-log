import { enclosingBlockName } from '@/debug-message/php/PHPDebugMessage/enclosingBlockName/enclosingBlockName';
import { BlockType } from '@/entities';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';
import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers/';

describe('PHP enclosingBlockName', () => {
  const phpParser = getPhpParser();
  const passingCases = [
    {
      name: 'inside named function',
      lines: ['<?php', 'function greet() {', '  $name = "Anas";', '}'],
      selectionLine: 2,
      expectedName: 'greet',
      blockType: 'function',
    },
    {
      name: 'inside class block',
      lines: [
        '<?php',
        'class Developer {',
        '  public function code() {',
        '    $lines = 100;',
        '  }',
        '}',
      ],
      selectionLine: 3,
      expectedName: 'Developer',
      blockType: 'class',
    },
    {
      name: 'inside method of a class',
      lines: [
        '<?php',
        'class Turbo {',
        '  public function build() {',
        '    $speed = "fast";',
        '  }',
        '}',
      ],
      selectionLine: 3,
      expectedName: 'build',
      blockType: 'function',
    },
    {
      name: 'inside class constructor method',
      lines: [
        '<?php',
        'class Person {',
        '  public function __construct($fullName) {',
        '    $this->fullName = $fullName;',
        '  }',
        '}',
      ],
      selectionLine: 3,
      expectedName: '__construct',
      blockType: 'function',
    },
    {
      name: 'inside nested class (class inside another context)',
      lines: [
        '<?php',
        'class Outer {',
        '  public function outer() {',
        '    $anon = new class {',
        '      public function inner() {',
        '        $val = 1;',
        '      }',
        '    };',
        '  }',
        '}',
      ],
      selectionLine: 5,
      expectedName: 'inner',
      blockType: 'function',
    },
    {
      name: 'inside static method',
      lines: [
        '<?php',
        'class Logger {',
        '  public static function log() {',
        '    $msg = "test";',
        '  }',
        '}',
      ],
      selectionLine: 3,
      expectedName: 'log',
      blockType: 'function',
    },
    {
      name: 'inside private method',
      lines: [
        '<?php',
        'class Utils {',
        '  private function helper() {',
        '    $data = [];',
        '  }',
        '}',
      ],
      selectionLine: 3,
      expectedName: 'helper',
      blockType: 'function',
    },
    {
      name: 'inside protected method',
      lines: [
        '<?php',
        'class Base {',
        '  protected function process() {',
        '    $result = true;',
        '  }',
        '}',
      ],
      selectionLine: 3,
      expectedName: 'process',
      blockType: 'function',
    },
  ];

  const failingCases = [
    {
      name: 'outside any function',
      lines: ['<?php', '$global = "value";'],
      selectionLine: 1,
      expectedName: '',
      blockType: 'function',
    },
    {
      name: 'outside any class',
      lines: ['<?php', 'function test() {}', '$value = 42;'],
      selectionLine: 2,
      expectedName: '',
      blockType: 'class',
    },
    {
      name: 'in anonymous closure without assignment',
      lines: [
        '<?php',
        'array_map(function($x) {',
        '  $result = $x * 2;',
        '  return $result;',
        '}, $data);',
      ],
      selectionLine: 2,
      expectedName: '',
      blockType: 'function',
    },
    {
      name: 'at file top level',
      lines: ['<?php', '', '$config = [];'],
      selectionLine: 2,
      expectedName: '',
      blockType: 'function',
    },
  ];

  describe('passing cases', () => {
    passingCases.forEach(
      ({ name, lines, selectionLine, expectedName, blockType }) => {
        it(name, () => {
          const document = makeTextDocument(lines);
          const ast = parseCode(document.getText(), phpParser);
          const result = enclosingBlockName(
            ast,
            document,
            selectionLine,
            blockType as BlockType,
          );
          expect(result).toBe(expectedName);
        });
      },
    );
  });

  describe('failing cases', () => {
    failingCases.forEach(
      ({ name, lines, selectionLine, expectedName, blockType }) => {
        it(name, () => {
          const document = makeTextDocument(lines);
          const ast = parseCode(document.getText(), phpParser);
          const result = enclosingBlockName(
            ast,
            document,
            selectionLine,
            blockType as BlockType,
          );
          expect(result).toBe(expectedName);
        });
      },
    );
  });

  describe('nested contexts', () => {
    it('should find the innermost function when nested', () => {
      const document = makeTextDocument([
        '<?php',
        'function outer() {',
        '  function inner() {',
        '    $value = 10;',
        '  }',
        '}',
      ]);
      const ast = parseCode(document.getText(), phpParser);
      const result = enclosingBlockName(ast, document, 3, 'function');
      expect(result).toBe('inner');
    });

    it('should find the innermost class when nested (anonymous class)', () => {
      const document = makeTextDocument([
        '<?php',
        'class Outer {',
        '  public function create() {',
        '    return new class {',
        '      public $prop = 1;',
        '    };',
        '  }',
        '}',
      ]);
      const ast = parseCode(document.getText(), phpParser);
      const result = enclosingBlockName(ast, document, 4, 'class');
      // php-parser finds the outer class for anonymous class contexts
      expect(result).toBe('Outer');
    });

    it('should find outer class when selecting in method', () => {
      const document = makeTextDocument([
        '<?php',
        'class MyService {',
        '  public function handle() {',
        '    $data = [];',
        '  }',
        '}',
      ]);
      const ast = parseCode(document.getText(), phpParser);
      const result = enclosingBlockName(ast, document, 3, 'class');
      expect(result).toBe('MyService');
    });
  });

  describe('edge cases', () => {
    it('should return empty string for null AST', () => {
      const document = makeTextDocument(['<?php', '$value = 1;']);
      // @ts-expect-error - Testing null case
      const result = enclosingBlockName(null, document, 1, 'function');
      expect(result).toBe('');
    });

    it('should handle selection at function declaration line', () => {
      const document = makeTextDocument([
        '<?php',
        'function test() {',
        '  $x = 1;',
        '}',
      ]);
      const ast = parseCode(document.getText(), phpParser);
      const result = enclosingBlockName(ast, document, 1, 'function');
      expect(result).toBe('test');
    });

    it('should handle selection at class declaration line', () => {
      const document = makeTextDocument([
        '<?php',
        'class Example {',
        '  public $prop;',
        '}',
      ]);
      const ast = parseCode(document.getText(), phpParser);
      const result = enclosingBlockName(ast, document, 1, 'class');
      expect(result).toBe('Example');
    });

    it('should handle multi-line function signatures', () => {
      const document = makeTextDocument([
        '<?php',
        'function complexFunc(',
        '  $param1,',
        '  $param2',
        ') {',
        '  $result = $param1 + $param2;',
        '}',
      ]);
      const ast = parseCode(document.getText(), phpParser);
      const result = enclosingBlockName(ast, document, 5, 'function');
      expect(result).toBe('complexFunc');
    });
  });

  describe('arrow functions', () => {
    it('should handle arrow function context (may return empty for anonymous)', () => {
      const document = makeTextDocument([
        '<?php',
        '$multiply = fn($x) => $x * 2;',
      ]);
      const ast = parseCode(document.getText(), phpParser);
      const result = enclosingBlockName(ast, document, 1, 'function');
      // Arrow functions without names typically return empty
      expect(result).toBe('');
    });
  });
});
