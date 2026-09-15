// Declaration inside an inline JSX handler of a returned element
export default {
  name: 'const inside an inline JSX handler of a returned element',
  fileExtension: '.tsx',
  lines: [
    'export function Toggle({ open, setOpen }) {',
    '  return (',
    '    <button',
    '      onClick={() => {',
    '        const next = !open;',
    '        setOpen(next);',
    '      }}',
    '    />',
    '  );',
    '}',
  ],
  selectionLine: 4,
  variableName: 'next',
};
