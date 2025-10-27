export default {
  name: 'array assignment to deeply nested object property',
  fileExtension: '.ts',
  lines: [
    'config.module.rules = [',
    '  ...filterModuleRules(config),',
    '  ...nextWebpackConfig.module.rules.map((rule) => {',
    "    if (rule.use && rule.use.loader === 'next-babel-loader') {",
    "      rule.use.loader = require.resolve('next/dist/build/webpack/loaders/next-babel-loader');",
    '    }',
    '    return rule;',
    '  }),',
    '];',
  ],
  selectionLine: 0,
  variableName: 'config.module.rules',
  expectedLine: 9,
};
