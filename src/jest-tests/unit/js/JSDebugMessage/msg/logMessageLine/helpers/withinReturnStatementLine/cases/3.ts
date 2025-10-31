// Multi-line return statement with complex expression
export default {
  name: 'multi-line return statement',
  fileExtension: '.ts',
  lines: [
    'function calculateTotal(order) {',
    '  return order.items.reduce(',
    '    (sum, item) => sum + item.price,',
    '    0',
    '  );',
    '}',
  ],
  selectionLine: 2, // Line inside the reduce function
  variableName: 'item.price',
  expected: 1, // Before the return statement
};
