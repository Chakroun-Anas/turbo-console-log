export default {
  name: "multi-line return, selection deep in the expression (insert before the return line)",
  lines: [
    "def f():",
    "    return (",
    "        a",
    "        + b",
    "    )",
  ],
  selectionLine: 2,
  expectedLine: 1,
};
