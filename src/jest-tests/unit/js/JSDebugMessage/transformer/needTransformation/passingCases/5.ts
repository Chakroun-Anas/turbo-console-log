// More complex: render function with implicit JSX return (should need transformation)
export default {
  name: 'render function with implicit JSX return and nested property',
  lines: [
    'const renderItem = (item: Item, idx: number) =>',
    '  <li key={item.id} title={`${item.label}-${idx}`}>',
    '    <Badge label={item.label} /> {idx}',
    '  </li>;',
  ],
  selectionLine: 2,
  variableName: 'item.label',
};
