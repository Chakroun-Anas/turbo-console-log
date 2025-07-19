export default {
  name: 'function call with nested calls and config object',
  lines: [
    'const result = callApi({',
    '  headers: getHeaders(),',
    '  payload: buildPayload(user),',
    '});',
  ],
  selectionLine: 0,
  variableName: 'result',
  expectedLine: 4,
};
