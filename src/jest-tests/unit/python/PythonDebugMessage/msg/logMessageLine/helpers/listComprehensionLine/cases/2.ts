export default {
  name: "comprehension inside a function body",
  lines: ["def foo():","    words = [w.strip() for w in lines]","    return words"],
  selectionLine: 1,
  expectedLine: 2,
};
