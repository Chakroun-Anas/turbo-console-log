// Arrow function returning JSX with nested property access
export default {
  name: 'render function with implicit JSX return and nested property',
  lines: [
    'const renderItem = (item: Item, idx: number) =>',
    '  <li key={item.id} title={`${item.label}-${idx}`}>',
    '    <Badge label={item.label} /> {idx}',
    '  </li>;',
  ],
  selectedVar: 'item.label',
  line: 2,
  debuggingMsg: 'console.log("🚀 ~ item.label:", item.label)',
  expected: [
    'const renderItem = (item: Item, idx: number) => {',
    '  console.log("🚀 ~ item.label:", item.label);',
    '  return <li key={item.id} title={`${item.label}-${idx}`}>',
    '    <Badge label={item.label} /> {idx}',
    '  </li>;',
    '};',
  ],
};
