export default {
  name: 'destructured binding of an awaited dynamic import',
  fileExtension: '.mjs',
  lines: ["const { readFile } = await import('node:fs/promises');"],
  selectionLine: 0,
  variableName: 'readFile',
};
