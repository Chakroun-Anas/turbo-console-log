export default {
  name: "indented for loop inside a function",
  lines: ["def foo():", "    for n in nums:", "        use(n)"],
  selectionLine: 1,
  expectedLine: 2,
};
