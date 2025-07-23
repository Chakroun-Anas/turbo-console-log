export default {
  name: 'multi-line typed function declaration',
  lines: [
    'function fetchData(',
    '  url: string,',
    '  method: "GET" | "POST",',
    '  headers?: Record<string, string>',
    ') {',
    '  return fetch(url);',
    '}',
  ],
  selectionLine: 3,
  variableName: 'headers',
  expected: 5,
};
