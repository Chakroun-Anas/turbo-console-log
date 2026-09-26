export default {
  name: 'member logically assigned (??=) to a multi-line new expression',
  lines: [
    'function getClient() {',
    '  globalThis.prisma ??= new PrismaClient({',
    "    log: ['query'],",
    '  });',
    '  return globalThis.prisma;',
    '}',
  ],
  fileExtension: '.js',
  selectionLine: 1,
  variableName: 'globalThis.prisma',
  expectedLine: 4,
};
