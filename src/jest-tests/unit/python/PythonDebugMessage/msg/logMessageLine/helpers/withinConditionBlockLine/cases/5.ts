export default {
  name: "multi-line if condition (insert before the if line)",
  lines: [
    "if (",
    "    a and b",
    "):",
    "    pass",
  ],
  selectionLine: 1,
  expectedLine: 0,
};
