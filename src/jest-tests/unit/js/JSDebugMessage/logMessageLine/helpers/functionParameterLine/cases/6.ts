export default {
  name: 'destructured props in arrow component',
  lines: [
    'const MyComponent = ({',
    '  title,',
    '  subtitle,',
    '  onClick',
    '}) => {',
    '  return <div onClick={onClick}>{title}</div>;',
    '};',
  ],
  selectionLine: 3,
  variableName: 'onClick',
  expected: 5,
};
