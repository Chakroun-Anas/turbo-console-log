export default {
  name: "property access inside a function body",
  lines: ["def foo():","    cfg = self.config","    return cfg"],
  selectionLine: 1,
  expectedLine: 2,
};
