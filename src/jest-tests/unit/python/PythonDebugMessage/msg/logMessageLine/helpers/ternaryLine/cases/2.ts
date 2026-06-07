export default {
  name: "ternary inside a function body",
  lines: ["def foo():","    val = x if x > 0 else 0","    return val"],
  selectionLine: 1,
  expectedLine: 2,
};
