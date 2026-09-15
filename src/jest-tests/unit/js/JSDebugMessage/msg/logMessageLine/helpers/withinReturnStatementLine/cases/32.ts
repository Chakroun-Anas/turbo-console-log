// Inner return of a map callback nested in an outer JSX return: the log goes
// before the inner return, where `item` is in scope
export default {
  name: 'inner return of a map callback nested in an outer return',
  fileExtension: '.tsx',
  lines: [
    'export function Menu({ items }) {',
    '  return (',
    '    <ul>',
    '      {items.map((item) => {',
    '        const isSelected = item.selected;',
    '        return (',
    "          <li className={isSelected ? 'active' : ''}>",
    '            {item.label}',
    '          </li>',
    '        );',
    '      })}',
    '    </ul>',
    '  );',
    '}',
  ],
  selectionLine: 7,
  variableName: 'item.label',
  expected: 5,
};
