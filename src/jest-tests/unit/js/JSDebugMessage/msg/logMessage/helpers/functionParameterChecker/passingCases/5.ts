export default {
  name: 'destructured parameter with default value',
  fileExtension: '.ts',
  lines: [
    'const login = ({ username = "guest" }) => {',
    '  console.log(username);',
    '};',
  ],
  selectionLine: 0,
  variableName: 'username',
};
