export default {
  fileExtension: '.ts',
  name: 'async fetch with complex destructuring - response.json() call',
  lines: [
    'fetch("https://api.webamp.org/graphql", {',
    '  body: JSON.stringify({',
    '    query: createWebampSkinMuseumQuery(',
    '      Math.floor(Math.random() * 1000)',
    '    ),',
    '  }),',
    '  headers: {',
    '    "Content-Type": "application/json",',
    '  },',
    '  method: "POST",',
    '}).then(async (response) => {',
    '  const { data } = ((await response.json()) ||',
    '    {}) as WebampApiResponse;',
    '',
    '  this.skinUrl = data?.skins?.nodes?.[0]?.download_url as string;',
    '  this.loading = false;',
    '});',
  ],
  selectionLine: 11, // Line with destructuring: const { data } = ((await response.json()) || ...)
  variableName: 'data',
  expectedLine: 13, // Should insert after the multi-line destructuring assignment (line 12 is end of assignment)
};
