// JSX return statement with optional chaining - log should go before the return
export default {
  name: 'JSX return with optional chaining (user.meta?.city)',
  fileExtension: '.tsx',
  lines: [
    'export default function Page({ user, items }) {',
    '  const fullName = `${user.firstName} ${user.lastName}`;',
    '  return (',
    '    <>',
    '      <h1>{fullName}</h1>',
    '      <div title={`${user.firstName}-${count}`}>Hello</div>',
    '      <p>{user.meta?.city ?? "Unknown"}</p>',
    '      {count > 0 && <div>Clicks: {count}</div>}',
    '    </>',
    '  );',
    '}',
  ],
  selectionLine: 6, // Line with user.meta?.city inside JSX
  variableName: 'user.meta?.city',
  expected: 2, // Before the return statement (line 2)
};
