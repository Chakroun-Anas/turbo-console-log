import { findEnclosingBlocks } from '@/debug-message/php/PHPDebugMessage/enclosingBlockName/findEnclosingBlocks';
import { parseCode } from '@/debug-message/php/PHPDebugMessage/msg/php-parser-utils';
import { makeTextDocument, getPhpParser } from '@/jest-tests/mocks/helpers/';

describe('PHP findEnclosingBlocks', () => {
  const phpParser = getPhpParser();
  describe('single traversal optimization', () => {
    it('should find both class and function in one AST traversal', () => {
      const document = makeTextDocument([
        '<?php',
        'class UserService {',
        '  public function create($name) {',
        '    $user = new User();',
        '    $user->name = $name;',
        '    return $user;',
        '  }',
        '}',
      ]);
      const ast = parseCode(document.getText(), phpParser);
      const result = findEnclosingBlocks(ast, document, 4);

      expect(result).toEqual({
        className: 'UserService',
        functionName: 'create',
      });
    });

    it('should find class and constructor', () => {
      const document = makeTextDocument([
        '<?php',
        'class Product {',
        '  public function __construct($price) {',
        '    $this->price = $price;',
        '  }',
        '}',
      ]);
      const ast = parseCode(document.getText(), phpParser);
      const result = findEnclosingBlocks(ast, document, 3);

      expect(result).toEqual({
        className: 'Product',
        functionName: '__construct',
      });
    });

    it('should find nested class and method', () => {
      const document = makeTextDocument([
        '<?php',
        'class Outer {',
        '  public function factory() {',
        '    return new class {',
        '      public function inner() {',
        '        $value = 42;',
        '      }',
        '    };',
        '  }',
        '}',
      ]);
      const ast = parseCode(document.getText(), phpParser);
      const result = findEnclosingBlocks(ast, document, 5);

      // Should find the innermost function
      expect(result.functionName).toBe('inner');
      // php-parser includes the outer class even for anonymous classes
      expect(result.className).toBe('Outer');
    });
  });

  describe('class only scenarios', () => {
    it('should find class when in class body but not in method', () => {
      const document = makeTextDocument([
        '<?php',
        'class Config {',
        '  public $setting = "default";',
        '}',
      ]);
      const ast = parseCode(document.getText(), phpParser);
      const result = findEnclosingBlocks(ast, document, 2);

      expect(result).toEqual({
        className: 'Config',
        functionName: '',
      });
    });

    it('should find outer class when selecting class property', () => {
      const document = makeTextDocument([
        '<?php',
        'class Settings {',
        '  private $config = [];',
        '  public $debug = false;',
        '}',
      ]);
      const ast = parseCode(document.getText(), phpParser);
      const result = findEnclosingBlocks(ast, document, 3);

      expect(result).toEqual({
        className: 'Settings',
        functionName: '',
      });
    });
  });

  describe('function only scenarios', () => {
    it('should find function when at top level (no class)', () => {
      const document = makeTextDocument([
        '<?php',
        'function processData($data) {',
        '  $result = [];',
        '  return $result;',
        '}',
      ]);
      const ast = parseCode(document.getText(), phpParser);
      const result = findEnclosingBlocks(ast, document, 2);

      expect(result).toEqual({
        className: '',
        functionName: 'processData',
      });
    });

    it('should find nested function when outside class', () => {
      const document = makeTextDocument([
        '<?php',
        'function outer() {',
        '  function inner() {',
        '    $x = 1;',
        '  }',
        '}',
      ]);
      const ast = parseCode(document.getText(), phpParser);
      const result = findEnclosingBlocks(ast, document, 3);

      expect(result).toEqual({
        className: '',
        functionName: 'inner',
      });
    });
  });

  describe('neither class nor function', () => {
    it('should return empty strings when at global scope', () => {
      const document = makeTextDocument([
        '<?php',
        '$globalVar = 100;',
        'define("CONSTANT", "value");',
      ]);
      const ast = parseCode(document.getText(), phpParser);
      const result = findEnclosingBlocks(ast, document, 1);

      expect(result).toEqual({
        className: '',
        functionName: '',
      });
    });

    it('should return empty strings for anonymous functions', () => {
      const document = makeTextDocument([
        '<?php',
        '$callback = function($x) {',
        '  return $x * 2;',
        '};',
      ]);
      const ast = parseCode(document.getText(), phpParser);
      const result = findEnclosingBlocks(ast, document, 2);

      expect(result).toEqual({
        className: '',
        functionName: '',
      });
    });

    it('should return empty strings for arrow functions', () => {
      const document = makeTextDocument([
        '<?php',
        '$square = fn($n) => $n * $n;',
      ]);
      const ast = parseCode(document.getText(), phpParser);
      const result = findEnclosingBlocks(ast, document, 1);

      expect(result).toEqual({
        className: '',
        functionName: '',
      });
    });
  });

  describe('depth-based selection (innermost wins)', () => {
    it('should select innermost class when nested', () => {
      const document = makeTextDocument([
        '<?php',
        'class Outer {',
        '  public function method() {',
        '    $anon = new class {',
        '      public function inner() {',
        '        $data = [];',
        '      }',
        '    };',
        '  }',
        '}',
      ]);
      const ast = parseCode(document.getText(), phpParser);
      const result = findEnclosingBlocks(ast, document, 5);

      // Should find inner function, not outer class for function
      expect(result.functionName).toBe('inner');
    });

    it('should select innermost function when nested', () => {
      const document = makeTextDocument([
        '<?php',
        'class Service {',
        '  public function outer() {',
        '    function nested() {',
        '      $value = 1;',
        '    }',
        '  }',
        '}',
      ]);
      const ast = parseCode(document.getText(), phpParser);
      const result = findEnclosingBlocks(ast, document, 4);

      expect(result).toEqual({
        className: 'Service',
        functionName: 'nested',
      });
    });
  });

  describe('static and visibility modifiers', () => {
    it('should find static method', () => {
      const document = makeTextDocument([
        '<?php',
        'class Math {',
        '  public static function add($a, $b) {',
        '    $sum = $a + $b;',
        '    return $sum;',
        '  }',
        '}',
      ]);
      const ast = parseCode(document.getText(), phpParser);
      const result = findEnclosingBlocks(ast, document, 3);

      expect(result).toEqual({
        className: 'Math',
        functionName: 'add',
      });
    });

    it('should find private method', () => {
      const document = makeTextDocument([
        '<?php',
        'class Helper {',
        '  private function internal() {',
        '    $secret = "hidden";',
        '  }',
        '}',
      ]);
      const ast = parseCode(document.getText(), phpParser);
      const result = findEnclosingBlocks(ast, document, 3);

      expect(result).toEqual({
        className: 'Helper',
        functionName: 'internal',
      });
    });

    it('should find protected method', () => {
      const document = makeTextDocument([
        '<?php',
        'class Base {',
        '  protected function helper() {',
        '    $data = [];',
        '  }',
        '}',
      ]);
      const ast = parseCode(document.getText(), phpParser);
      const result = findEnclosingBlocks(ast, document, 3);

      expect(result).toEqual({
        className: 'Base',
        functionName: 'helper',
      });
    });
  });

  describe('edge cases', () => {
    it('should handle null AST gracefully', () => {
      const document = makeTextDocument(['<?php', '$x = 1;']);
      // @ts-expect-error - Testing null case
      const result = findEnclosingBlocks(null, document, 1);

      expect(result).toEqual({
        className: '',
        functionName: '',
      });
    });

    it('should handle selection at class declaration line', () => {
      const document = makeTextDocument([
        '<?php',
        'class Example {',
        '  public function test() {',
        '    $x = 1;',
        '  }',
        '}',
      ]);
      const ast = parseCode(document.getText(), phpParser);
      const result = findEnclosingBlocks(ast, document, 1);

      expect(result).toEqual({
        className: 'Example',
        functionName: '',
      });
    });

    it('should handle selection at method declaration line', () => {
      const document = makeTextDocument([
        '<?php',
        'class Service {',
        '  public function process() {',
        '    $result = true;',
        '  }',
        '}',
      ]);
      const ast = parseCode(document.getText(), phpParser);
      const result = findEnclosingBlocks(ast, document, 2);

      expect(result).toEqual({
        className: 'Service',
        functionName: 'process',
      });
    });

    it('should handle multi-line method signatures', () => {
      const document = makeTextDocument([
        '<?php',
        'class Calculator {',
        '  public function compute(',
        '    $a,',
        '    $b',
        '  ) {',
        '    $result = $a + $b;',
        '  }',
        '}',
      ]);
      const ast = parseCode(document.getText(), phpParser);
      const result = findEnclosingBlocks(ast, document, 6);

      expect(result).toEqual({
        className: 'Calculator',
        functionName: 'compute',
      });
    });
  });
});
