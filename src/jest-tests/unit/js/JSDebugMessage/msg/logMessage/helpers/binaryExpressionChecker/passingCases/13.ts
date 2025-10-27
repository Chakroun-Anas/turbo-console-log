export default {
  fileExtension: '.ts',
  name: 'binary expression with optional chaining and inequality (!==)',
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
  selectionLine: 8, // Line with the binary expression assignment
  variableName: 'isTopWindow',
};
