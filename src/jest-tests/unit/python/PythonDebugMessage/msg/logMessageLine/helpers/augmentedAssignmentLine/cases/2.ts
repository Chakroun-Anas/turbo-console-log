export default {
  name: "augmented assignment inside a function",
  lines: ["def foo():","    total -= discount","    return total"],
  selectionLine: 1,
  expectedLine: 2,
};
