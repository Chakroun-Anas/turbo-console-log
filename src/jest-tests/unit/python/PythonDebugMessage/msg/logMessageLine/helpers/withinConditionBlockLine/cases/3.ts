export default {
  name: "indented if inside a function",
  lines: ["def foo():","    if cond:","        pass"],
  selectionLine: 1,
  expectedLine: 1,
};
