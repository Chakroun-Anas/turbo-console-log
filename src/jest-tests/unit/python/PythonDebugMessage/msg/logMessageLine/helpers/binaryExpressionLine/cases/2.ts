export default {
  name: "binary expression inside a function",
  lines: ["def foo():","    diff = end - start","    return diff"],
  selectionLine: 1,
  expectedLine: 2,
};
