export default {
  name: 'function call with template literal and options object',
  fileExtension: '.ts',
  lines: [
    'const proc = exec(',
    '  `java -jar ${googleJavaFormatPath} --dry-run $(${javaFilesCommand})`,',
    '  { silent: true },',
    ');',
  ],
  selectionLine: 0,
  variableName: 'proc',
};
