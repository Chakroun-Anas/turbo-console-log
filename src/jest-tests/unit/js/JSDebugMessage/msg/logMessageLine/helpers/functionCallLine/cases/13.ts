export default {
  name: 'function call inside object literal queryFn',
  lines: [
    'const currencies = useQuery({',
    '  enabled: false,',
    '  queryFn: () => sdk.unified.getCurrencies(),',
    "  queryKey: ['settings', 'currencies'],",
    '});',
  ],
  selectionLine: 0,
  variableName: 'currencies',
  expectedLine: 5,
};
