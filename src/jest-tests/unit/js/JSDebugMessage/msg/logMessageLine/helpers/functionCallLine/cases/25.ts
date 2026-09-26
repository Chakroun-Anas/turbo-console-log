export default {
  fileExtension: '.tsx',
  name: 'const inside a callback of a destructured call declaration - after the inner declaration',
  lines: [
    'export function useUser(id: string) {',
    '  const { data, error } = useSWR(`/api/users/${id}`, async (url: string) => {',
    '    const res = await fetch(url);',
    '    return res.json();',
    '  });',
    '  return { user: data, error };',
    '}',
  ],
  selectionLine: 2,
  variableName: 'res',
  expectedLine: 3,
};
