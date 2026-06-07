export default {
  name: "f-string inside a function body",
  lines: ["def foo():","    label = f\"Score: {n}\"","    return label"],
  selectionLine: 1,
  expectedLine: 2,
};
