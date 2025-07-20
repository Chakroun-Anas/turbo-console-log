export default {
  name: 'array destructuring from process.argv.slice() with surrounding context',
  lines: [
    'const deployTarball = async () => {',
    '  const [',
    '    githubSha,',
    '    githubWorkflowSha,',
    "    tarballDirectory = path.join(os.tmpdir(), 'vercel-nextjs-preview-tarballs'),",
    '  ] = process.argv.slice(2)',
    "  const repoRoot = path.resolve(__dirname, '..')",
    '',
    '  // Rest of the function logic',
    '  console.log(`Deploying tarball for ${githubSha}`)',
    '  return deploy(tarballDirectory)',
    '}',
  ],
  selectionLine: 2,
  variableName: 'githubSha',
  expectedLine: 6, // Should insert after the array destructuring assignment completes
};
