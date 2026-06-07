export default {
  name: "method call inside a function body",
  lines: ["def foo():","    data = self.fetch(url)","    return data"],
  selectionLine: 1,
  expectedLine: 2,
};
