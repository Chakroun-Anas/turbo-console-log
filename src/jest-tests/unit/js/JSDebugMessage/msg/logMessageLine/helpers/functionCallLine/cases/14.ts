export default {
  fileExtension: '.ts',
  name: 'function call with template literal and options object',
  lines: [
    'const proc = exec(',
    '  `java -jar ${googleJavaFormatPath} --dry-run $(${javaFilesCommand})`,',
    '  { silent: true },',
    ');',
  ],
  selectionLine: 0,
  variableName: 'proc',
  expectedLine: 4,
};
