export default {
  name: 'function call inside object literal queryFn',
  fileExtension: '.ts',
  lines: [
    'const currencies = useQuery({',
    '  enabled: false,',
    '  queryFn: () => sdk.unified.getCurrencies(),',
    "  queryKey: ['settings', 'currencies'],",
    '});',
  ],
  selectionLine: 0,
  variableName: 'currencies',
};
