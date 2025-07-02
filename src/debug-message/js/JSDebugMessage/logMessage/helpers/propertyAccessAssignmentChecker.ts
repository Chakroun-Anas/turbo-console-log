import { LineCodeProcessing } from '../../../../../line-code-processing';

export function propertyAccessAssignmentChecker(
  lineCodeProcessing: LineCodeProcessing,
  fullRhs: string,
) {
  if (!lineCodeProcessing.isAssignedToVariable(fullRhs)) {
    return { isChecked: false };
  }

  const assignmentMatch = fullRhs.match(/=\s*(.+)$/);
  if (!assignmentMatch) return { isChecked: false };

  const rhs = assignmentMatch[1].trim().replace(/;$/, '');

  // Accept chained access: dot, optional chaining, bracket notation
  const safeExpressionRegex =
    /^[a-zA-Z_$][\w$]*(?:(\?\.|\.)[a-zA-Z_$][\w$]*|\[(?:["'][^"']+["']|\d+)\]|\?\.\[(?:["'][^"']+["']|\d+)\])*$/;

  const isSafeExpression = safeExpressionRegex.test(rhs);

  return { isChecked: isSafeExpression };
}
