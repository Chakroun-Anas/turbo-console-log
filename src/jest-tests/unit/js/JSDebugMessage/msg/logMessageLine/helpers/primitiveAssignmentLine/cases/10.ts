export default {
  name: 'parenthesized multi-line JSX const - after the closing parenthesis',
  fileExtension: '.tsx',
  lines: [
    'export function Header({ title }: { title: string }) {',
    '  const header = (',
    '    <header>',
    '      <h1>{title}</h1>',
    '    </header>',
    '  );',
    '  return header;',
    '}',
  ],
  selectionLine: 1,
  variableName: 'header',
  expectedLine: 6,
};
