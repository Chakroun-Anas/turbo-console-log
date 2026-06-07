export default {
  name: "multi-line method call assignment (insert after the closing paren)",
  lines: [
    "result = obj.compute(",
    "    a,",
    "    b,",
    ")",
    "print(result)",
  ],
  selectionLine: 0,
  expectedLine: 4,
};
