export default {
  fileExtension: '.tsx',
  name: 'multi-line new expression declaration - after the statement',
  lines: [
    'const queryClient = new QueryClient({',
    '  defaultOptions: {',
    '    queries: { staleTime: 60_000 },',
    '  },',
    '});',
    'export default queryClient;',
  ],
  selectionLine: 0,
  variableName: 'queryClient',
  expectedLine: 5,
};
