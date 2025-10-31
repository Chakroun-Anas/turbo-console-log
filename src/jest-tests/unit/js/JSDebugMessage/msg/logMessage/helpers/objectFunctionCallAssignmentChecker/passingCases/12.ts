export default {
  name: 'array destructuring from process.argv.slice() with object function call',
  fileExtension: '.ts',
  lines: [
    'const [',
    '  githubSha,',
    '  githubWorkflowSha,',
    "  tarballDirectory = path.join(os.tmpdir(), 'vercel-nextjs-preview-tarballs'),",
    '] = process.argv.slice(2)',
    "const repoRoot = path.resolve(__dirname, '..')",
  ],
  selectionLine: 1,
  variableName: 'githubSha',
};
