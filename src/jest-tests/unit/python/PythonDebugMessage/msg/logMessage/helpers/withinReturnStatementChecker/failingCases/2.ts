export default {
  name: "variable in function body, not in return",
  lines: ["def foo():","    x = 10","    return x"],
  selectionLine: 1,
  variableName: "x",
};
