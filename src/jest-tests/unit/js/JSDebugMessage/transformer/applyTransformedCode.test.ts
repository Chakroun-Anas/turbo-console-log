import { applyTransformedCode } from '@/debug-message/js/JSDebugMessage/transformer/applyTransformedCode';
import {
  makeTextDocument,
  makeTextEditor,
  createMockTextEditorEdit,
} from '@/jest-tests/mocks/helpers';
import * as vscode from 'vscode';

describe('applyTransformedCode', () => {
  let mockTextEditorEdit: jest.Mocked<vscode.TextEditorEdit>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTextEditorEdit =
      createMockTextEditorEdit() as jest.Mocked<vscode.TextEditorEdit>;
  });

  const setupMockEditor = (document: vscode.TextDocument) => {
    const editor = makeTextEditor({ document });
    (editor.edit as jest.Mock).mockImplementation((callback) => {
      callback(mockTextEditorEdit);
      return Promise.resolve(true);
    });
    vscode.window.activeTextEditor = editor;
    return editor;
  };

  describe('early returns', () => {
    it('should return early when no active editor', async () => {
      vscode.window.activeTextEditor = undefined;
      const document = makeTextDocument(['const x = 1;']);

      await applyTransformedCode(document, 'const x = 2;');

      // No expectations needed since function returns early
    });
  });

  describe('function transformation scenarios', () => {
    it('should transform arrow function with implicit return to explicit body with debug log', async () => {
      const originalLines = ['const double = (x) => x * 2;'];
      const document = makeTextDocument(originalLines);
      const editor = setupMockEditor(document);

      const transformedCode = `const double = (x) => {
  console.log("x:", x);
  return x * 2;
};`;
      await applyTransformedCode(document, transformedCode);

      expect(editor.edit).toHaveBeenCalledWith(expect.any(Function));
      expect(mockTextEditorEdit.replace).toHaveBeenCalledWith(
        expect.anything(),
        `{
  console.log("x:", x);
  return x * 2;
}`,
      );
    });

    it('should transform arrow function with expression body to block with debug log', async () => {
      const originalLines = ['const compute = (a, b) => a + b * 2;'];
      const document = makeTextDocument(originalLines);
      setupMockEditor(document);

      const transformedCode = `const compute = (a, b) => {
  console.log("a:", a);
  return a + b * 2;
};`;
      await applyTransformedCode(document, transformedCode);

      expect(mockTextEditorEdit.replace).toHaveBeenCalledWith(
        new vscode.Range(
          new vscode.Position(0, 26),
          new vscode.Position(0, 35),
        ),
        `{
  console.log("a:", a);
  return a + b * 2;
}`,
      );
    });

    it('should transform function declaration with empty body to include debug log', async () => {
      const originalLines = ['function greet(name) {}'];
      const document = makeTextDocument(originalLines);
      setupMockEditor(document);

      const transformedCode = `function greet(name) {
  console.log("name:", name);
}`;
      await applyTransformedCode(document, transformedCode);

      expect(mockTextEditorEdit.replace).toHaveBeenCalledWith(
        new vscode.Range(
          new vscode.Position(0, 22),
          new vscode.Position(0, 22),
        ),
        `
  console.log("name:", name);
`,
      );
    });

    it('should transform function declaration with parameters and empty body', async () => {
      const originalLines = ['function calculate(x, y, z) {}'];
      const document = makeTextDocument(originalLines);
      setupMockEditor(document);

      const transformedCode = `function calculate(x, y, z) {
  console.log("x:", x);
}`;
      await applyTransformedCode(document, transformedCode);

      expect(mockTextEditorEdit.replace).toHaveBeenCalledWith(
        new vscode.Range(
          new vscode.Position(0, 29),
          new vscode.Position(0, 29),
        ),
        `
  console.log("x:", x);
`,
      );
    });

    it('should transform constructor with parameters and empty body', async () => {
      const originalLines = ['constructor(name, age) {}'];
      const document = makeTextDocument(originalLines);
      setupMockEditor(document);

      const transformedCode = `constructor(name, age) {
  console.log("name:", name);
}`;
      await applyTransformedCode(document, transformedCode);

      expect(mockTextEditorEdit.replace).toHaveBeenCalledWith(
        new vscode.Range(
          new vscode.Position(0, 24),
          new vscode.Position(0, 24),
        ),
        `
  console.log("name:", name);
`,
      );
    });

    it('should transform class constructor with multiple parameters', async () => {
      const originalLines = ['  constructor(id, data, options) {}'];
      const document = makeTextDocument(originalLines);
      setupMockEditor(document);

      const transformedCode = `  constructor(id, data, options) {
    console.log("id:", id);
  }`;
      await applyTransformedCode(document, transformedCode);

      expect(mockTextEditorEdit.replace).toHaveBeenCalledWith(
        new vscode.Range(
          new vscode.Position(0, 34),
          new vscode.Position(0, 34),
        ),
        `
    console.log("id:", id);
  `,
      );
    });

    it('should transform method with parameters and empty body', async () => {
      const originalLines = ['  process(data, callback) {}'];
      const document = makeTextDocument(originalLines);
      setupMockEditor(document);

      const transformedCode = `  process(data, callback) {
    console.log("data:", data);
  }`;
      await applyTransformedCode(document, transformedCode);

      expect(mockTextEditorEdit.replace).toHaveBeenCalledWith(
        new vscode.Range(
          new vscode.Position(0, 27),
          new vscode.Position(0, 27),
        ),
        `
    console.log("data:", data);
  `,
      );
    });
  });
});
