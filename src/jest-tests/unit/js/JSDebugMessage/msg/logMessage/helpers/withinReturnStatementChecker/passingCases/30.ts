// Inner return of a map callback nested in an outer JSX return: the inner
// return owns the selection
export default {
  name: 'member in the inner return of a map callback nested in a return',
  fileExtension: '.tsx',
  lines: [
    'export function List({ items }) {',
    '  return (',
    '    <ul>',
    '      {items.map((item) => {',
    '        return <li key={item.id}>{item.label}</li>;',
    '      })}',
    '    </ul>',
    '  );',
    '}',
  ],
  selectionLine: 4,
  variableName: 'item.label',
};
