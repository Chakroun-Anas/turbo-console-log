export default {
  name: 'multi-line function parameter with type annotation',
  lines: [
    'function saveUser(',
    '  id: number,',
    '  user: { name: string; email: string },',
    ') {',
    '  console.log(user);',
    '}',
  ],
  selectionLine: 2,
  variableName: 'user',
};
