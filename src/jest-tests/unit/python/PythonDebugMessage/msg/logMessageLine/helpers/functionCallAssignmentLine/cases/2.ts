export default {
  name: "function call inside a function body",
  lines: ["def foo():","    parsed = parse(raw)","    return parsed"],
  selectionLine: 1,
  expectedLine: 2,
};
