export default {
  fileExtension: '.ts',
  name: 'should insert before assignment with await execa in function call',
  lines: [
    'async function getChangedFiles(diffRevision) {',
    '  const changesResult = await execa(',
    '    `git diff \\${diffRevision} --name-only`,',
    '    EXECA_OPTS',
    '  ).catch((err) => {',
    '    console.error(err);',
    "    return { stdout: '', stderr: '' };",
    '  });',
    "  return changesResult.stdout.split('\\n').filter(Boolean);",
    '}',
  ],
  selectionLine: 1,
  variableName: 'changesResult',
  expectedLine: 8,
};
