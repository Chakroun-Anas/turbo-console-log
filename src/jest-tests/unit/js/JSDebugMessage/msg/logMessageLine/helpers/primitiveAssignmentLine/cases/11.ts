export default {
  name: 'defaulted key in a multi-line destructuring - after the declaration',
  fileExtension: '.tsx',
  lines: [
    'export function Button(props: ButtonProps) {',
    '  const {',
    '    children,',
    "    variant = 'primary',",
    '  } = props;',
    '  return <button className={variant}>{children}</button>;',
    '}',
  ],
  selectionLine: 3,
  variableName: 'variant',
  expectedLine: 5,
};
