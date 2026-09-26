export default {
  fileExtension: '.tsx',
  name: 'declaration named like a member property of a same-line arrow body',
  lines: [
    'const user = useSelector((state: RootState) => state.auth.user);',
    'render(user);',
  ],
  selectionLine: 0,
  variableName: 'user',
};
