// Multi-line return statement
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
  selectionLine: 2, // Inside the reduce function
  variableName: 'item.price',
};
