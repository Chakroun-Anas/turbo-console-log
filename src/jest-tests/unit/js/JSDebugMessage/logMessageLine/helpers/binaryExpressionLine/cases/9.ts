export default {
  name: 'complex assignment with binary expression - GitHub event parsing',
  lines: [
    'async function deployToPreview() {',
    '  const fs = require("fs").promises;',
    '  eventData = JSON.parse(',
    '    await fs.readFile(process.env.GITHUB_EVENT_PATH || "", "utf8")',
    '  )["pull_request"] || {};',
    '  const prNumber = eventData.number;',
    '  console.log("Deploying PR:", prNumber);',
    '}',
  ],
  selectionLine: 2,
  variableName: 'eventData',
  expectedLine: 5,
};
