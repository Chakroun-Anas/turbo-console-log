export default {
  name: 'object assignment with optionalDependencies[key].replace',
  lines: [
    'const optionalDependencies = { DEPLOY_URL: "foo" };',
    'const key = "DEPLOY_URL";',
    'optionalDependencies[key] = optionalDependencies[key].replace(',
    "  'DEPLOY_URL',",
    '  process.env.VERCEL_URL',
    ')',
  ],
  selectionLine: 2,
  variableName: 'optionalDependencies[key]',
};
