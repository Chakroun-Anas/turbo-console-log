export default {
  name: 'nested destructuring with computed property names',
  lines: ['const {', '  processes: { [id]: process },', '} = useProcesses();'],
  selectionLine: 1, // line with "processes: { [id]: process }"
  variableName: 'process',
  expectedLine: 3, // line after the destructuring assignment
};
