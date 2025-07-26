export default {
  name: 'destructured parameter in arrow function',
  lines: [
    'const x: number = 7;',
    'const handleSubmit = ({ user, email }) => {',
    '  console.log(user, email);',
    '};',
  ],
  selectionLine: 1,
  variableName: 'email',
};
