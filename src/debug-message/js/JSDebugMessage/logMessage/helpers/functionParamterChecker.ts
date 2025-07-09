import { functionParameterLine } from '@/debug-message/js/JSDebugMessageLine/helpers';
import { LogMessage } from '@/entities';
import ts from 'typescript';
import { TextDocument } from 'vscode';

export function functionParameterChecker(
  document: TextDocument,
  selectionLine: number,
  variableName: string,
) {
  const wanted = variableName.trim();
  if (!wanted) return { isChecked: false };

  const source = ts.createSourceFile(
    document.fileName,
    document.getText(),
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
  );

  let match = false;

  ts.forEachChild(source, function visit(node) {
    if (match) return;

    if (ts.isParameter(node)) {
      const startLine = document.positionAt(node.getStart()).line;
      const endLine = document.positionAt(node.getEnd()).line;

      if (selectionLine >= startLine && selectionLine <= endLine) {
        if (paramContainsIdentifier(node.name, wanted)) {
          match = true;
          return;
        }
      }
    }

    ts.forEachChild(node, visit);
  });
  return {
    isChecked: match,
    metadata: {
      closingContextLine: functionParameterLine(
        document,
        selectionLine,
        variableName,
      ),
    } as Pick<LogMessage, 'metadata'>,
  };
}

/*──────────────── helper ────────────────*/

function paramContainsIdentifier(
  name: ts.BindingName,
  wanted: string,
): boolean {
  if (ts.isIdentifier(name)) {
    return name.text === wanted;
  }

  if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) {
    return name.elements.some((el) => {
      // Guard against omitted or malformed elements
      if (ts.isBindingElement(el)) {
        return paramContainsIdentifier(el.name, wanted);
      }
      return false;
    });
  }

  return false;
}
