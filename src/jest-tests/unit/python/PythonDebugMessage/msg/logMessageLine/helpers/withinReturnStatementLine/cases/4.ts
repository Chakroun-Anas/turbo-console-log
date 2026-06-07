export default {
  name: "fallback when not a return statement",
  lines: ["x = 42"],
  selectionLine: 0,
  expectedLine: 1,
};
