export default {
  name: 'async arrow function with block body',
  lines: [
    'const fetchData = async () => {',
    '  const res = await fetch("/api");',
    '  return await res.json();',
    '};',
    'fetchData();',
  ],
  selectionLine: 0,
  selectedVar: 'fetchData',
  expectedLine: 4,
};
