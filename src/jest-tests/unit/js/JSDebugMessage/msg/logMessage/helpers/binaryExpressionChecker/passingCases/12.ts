export default {
  name: 'complex assignment with binary expression and property access',
  lines: [
    'eventData =',
    "  JSON.parse(await fs.readFile(process.env.GITHUB_EVENT_PATH || '', 'utf8'))[",
    "    'pull_request'",
    '  ] || {}',
  ],
  selectionLine: 0,
  variableName: 'eventData',
};
