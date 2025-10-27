export default {
  name: "ternary exists but destructured variable doesn't match",
  fileExtension: '.ts',
  lines: ['const {', '  apiKey = cond ? "yes" : "no",', '} = config;'],
  selectionLine: 1,
  variableName: 'region',
};
