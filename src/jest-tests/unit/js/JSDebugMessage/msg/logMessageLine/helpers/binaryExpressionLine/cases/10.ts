export default {
  name: 'binary expression assignment within try-catch block',
  fileExtension: '.tsx',
  lines: [
    'import { join } from "path";',
    'import { useTheme } from "styled-components";',
    'import { useCallback, useEffect, useMemo, useRef } from "react";',
    '',
    'let isTopWindow = !window.top || window === window.top;',
    '',
    'if (!isTopWindow) {',
    '  try {',
    '    isTopWindow = window.location.origin !== window.top?.location.origin;',
    '  } catch {',
    "    // Can't read origin, assume top window",
    '    isTopWindow = true;',
    '  }',
    '}',
  ],
  selectionLine: 8, // Line with: isTopWindow = window.location.origin !== window.top?.location.origin;
  variableName: 'isTopWindow',
  expectedLine: 9, // Line after the binary expression assignment
};
