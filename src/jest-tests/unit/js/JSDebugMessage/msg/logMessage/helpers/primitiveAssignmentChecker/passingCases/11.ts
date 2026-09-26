export default {
  name: 'defaulted key in a destructuring of process.env',
  fileExtension: '.cjs',
  lines: ['const {', '  PORT = 3000,', '  DATABASE_URL,', '} = process.env;'],
  selectionLine: 1,
  variableName: 'PORT',
};
