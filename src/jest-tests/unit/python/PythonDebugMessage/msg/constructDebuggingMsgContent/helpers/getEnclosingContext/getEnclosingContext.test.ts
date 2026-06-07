/**
 * Unit tests for Python getEnclosingContext
 *
 * Verifies that the function walks the Lezer AST to find enclosing
 * function and class names at a given line.
 */
import { getEnclosingContext } from '@/debug-message/python/PythonDebugMessage/msg/constructDebuggingMsgContent/helpers/getEnclosingContext/getEnclosingContext';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';
import { parseCode } from '@/debug-message/python/PythonDebugMessage/msg/python-parser-utils/parseCode';

describe('Python getEnclosingContext', () => {
  describe('function name detection', () => {
    it('returns the enclosing function name for a variable inside a function', () => {
      const doc = makeTextDocument(
        ['def process_user(user_id):', '    user_name = "John"'],
        'test.py',
        'python',
      );
      const program = parseCode(doc);
      const { functionName, className } = getEnclosingContext(
        program,
        doc,
        1, // line index of user_name = "John"
        false,
        true,
      );
      expect(functionName).toBe('process_user');
      expect(className).toBe('');
    });

    it('returns the enclosing function name for a function parameter line', () => {
      const doc = makeTextDocument(
        ['def calculate_total(price, tax):', '    return price + tax'],
        'test.py',
        'python',
      );
      const program = parseCode(doc);
      const { functionName } = getEnclosingContext(
        program,
        doc,
        0, // line index of def (the parameter line)
        false,
        true,
      );
      expect(functionName).toBe('calculate_total');
    });

    it('returns empty string for top-level code with no enclosing function', () => {
      const doc = makeTextDocument(
        ['name = "Alice"', 'age = 30'],
        'test.py',
        'python',
      );
      const program = parseCode(doc);
      const { functionName, className } = getEnclosingContext(
        program,
        doc,
        0,
        false,
        true,
      );
      expect(functionName).toBe('');
      expect(className).toBe('');
    });

    it('returns empty string when insertEnclosingFunction is false', () => {
      const doc = makeTextDocument(
        ['def foo():', '    x = 42'],
        'test.py',
        'python',
      );
      const program = parseCode(doc);
      const { functionName } = getEnclosingContext(
        program,
        doc,
        1,
        false,
        false, // disabled
      );
      expect(functionName).toBe('');
    });
  });

  describe('class name detection', () => {
    it('returns the enclosing class name for a method inside a class', () => {
      const doc = makeTextDocument(
        [
          'class MyService:',
          '    def run(self):',
          '        result = self.compute()',
        ],
        'test.py',
        'python',
      );
      const program = parseCode(doc);
      const { className, functionName } = getEnclosingContext(
        program,
        doc,
        2, // line index of result = ...
        true,
        true,
      );
      expect(className).toBe('MyService');
      expect(functionName).toBe('run');
    });

    it('returns empty class name for a standalone function (no class)', () => {
      const doc = makeTextDocument(
        ['def helper():', '    value = 1'],
        'test.py',
        'python',
      );
      const program = parseCode(doc);
      const { className } = getEnclosingContext(
        program,
        doc,
        1,
        true,
        false,
      );
      expect(className).toBe('');
    });

    it('returns empty class name when insertEnclosingClass is false', () => {
      const doc = makeTextDocument(
        ['class Foo:', '    x = 1'],
        'test.py',
        'python',
      );
      const program = parseCode(doc);
      const { className } = getEnclosingContext(
        program,
        doc,
        1,
        false, // disabled
        false,
      );
      expect(className).toBe('');
    });
  });

  describe('parameter selected on an indented def line (regression)', () => {
    // Regression: selecting a parameter on a class method's `def` line resolved
    // at column 0, which lands in the class body's indentation *before* the
    // FunctionDefinition starts — so the method name was dropped and only the
    // class name survived (produced "Class ~ param" instead of
    // "Class ~ method ~ param").
    it('returns both class and method name for a param on a method def line', () => {
      const doc = makeTextDocument(
        [
          'class PreparedRequest:',
          '    def prepare_method(self, method):',
          '        self.method = method',
        ],
        'test.py',
        'python',
      );
      const program = parseCode(doc);
      const { className, functionName } = getEnclosingContext(
        program,
        doc,
        1, // the def line itself (where the parameter lives)
        true,
        true,
      );
      expect(className).toBe('PreparedRequest');
      expect(functionName).toBe('prepare_method');
    });

    it('returns the function name for a param on a nested function def line', () => {
      const doc = makeTextDocument(
        [
          'def outer():',
          '    def inner(value):',
          '        return value',
        ],
        'test.py',
        'python',
      );
      const program = parseCode(doc);
      const { functionName } = getEnclosingContext(
        program,
        doc,
        1, // the nested `def inner(value):` line
        false,
        true,
      );
      expect(functionName).toBe('inner');
    });
  });

  describe('async functions (regression — async keyword must not hide the name)', () => {
    it('returns the enclosing function name for a variable inside an async def', () => {
      const doc = makeTextDocument(
        ['async def fetch_user(user_id):', '    result = user_id'],
        'test.py',
        'python',
      );
      const program = parseCode(doc);
      const { functionName } = getEnclosingContext(program, doc, 1, false, true);
      expect(functionName).toBe('fetch_user');
    });

    it('returns the function name for a param on an async def line', () => {
      const doc = makeTextDocument(
        ['async def stream(session, url):', '    return session'],
        'test.py',
        'python',
      );
      const program = parseCode(doc);
      const { functionName } = getEnclosingContext(program, doc, 0, false, true);
      expect(functionName).toBe('stream');
    });
  });
});
