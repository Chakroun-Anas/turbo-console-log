export default {
  name: 'property access in declaration',
  fileExtension: '.ts',
  lines: ['const x = user.profile.name;'],
  selectionLine: 0,
  variableName: 'user.profile.name',
  expectedLine: 1,
};
