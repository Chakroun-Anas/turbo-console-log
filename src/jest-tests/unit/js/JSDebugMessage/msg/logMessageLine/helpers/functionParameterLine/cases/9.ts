export default {
  name: 'inline arrow component without block',
  lines: ['const Hello = ({ name }) => <div>Hello {name}</div>;'],
  selectionLine: 0,
  variableName: 'name',
  expected: 1,
};
