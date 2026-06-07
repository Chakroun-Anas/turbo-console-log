export default {
  name: "subscript access inside a function body",
  lines: ["def foo():","    val = data[key]","    return val"],
  selectionLine: 1,
  expectedLine: 2,
};
