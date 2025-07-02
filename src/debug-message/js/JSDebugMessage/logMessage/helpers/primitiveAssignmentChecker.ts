import { TextDocument } from 'vscode';
import { LineCodeProcessing } from '../../../../../line-code-processing';

export function primitiveAssignmentChecker(
  document: TextDocument,
  lineCodeProcessing: LineCodeProcessing,
  selectionLine: number,
) {
  const currentLineText = document.lineAt(selectionLine).text;
  const trimmedLine = currentLineText.trim();

  // 1️⃣ Still make sure it's an assignment
  if (!lineCodeProcessing.isAssignedToVariable(trimmedLine)) {
    return { isChecked: false };
  }

  // 2️⃣ Grab RHS
  const assignmentMatch = trimmedLine.match(/=\s*(.+)$/);
  if (!assignmentMatch) return { isChecked: false };

  const rhs = assignmentMatch[1].trim();

  // 3️⃣ NEW: if RHS ends with a continuation token, it's NOT primitive
  if (/[.[]$|(?:\?\.)$/.test(rhs)) {
    return { isChecked: false };
  }

  // 4️⃣ Primitive literal / plain identifier test (unchanged)
  const isPrimitive =
    /^(\d+(\.\d+)?|['"`][\s\S]*['"`]|true|false|null|undefined|\w+(?:\.\w+)*);?$/.test(
      rhs,
    );

  return { isChecked: isPrimitive };
}
