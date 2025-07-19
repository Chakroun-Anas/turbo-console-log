export default {
  name: 'callback function passed as argument',
  lines: [
    'const handler = setListener("click", () => {',
    '  console.log("clicked");',
    '});',
  ],
  selectionLine: 0,
  variableName: 'handler',
  expectedLine: 3,
};
