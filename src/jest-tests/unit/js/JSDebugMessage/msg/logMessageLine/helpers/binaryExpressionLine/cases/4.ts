export default {
  name: 'nullish coalescing, selection on line 0',
  fileExtension: '.ts',
  lines: ['const name = input ?? "Anonymous";', 'save(name);'],
  selectionLine: 0,
  variableName: 'name',
  expectedLine: 1,
};
