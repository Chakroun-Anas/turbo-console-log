export default {
  name: "for loop at top level (insert as first body statement)",
  lines: ["for item in items:", "    process(item)"],
  selectionLine: 0,
  expectedLine: 1,
};
