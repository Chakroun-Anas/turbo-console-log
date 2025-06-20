// @ts-nocheck

async function webpackFinal(config) {
  const nextConfig = await loadConfig(PHASE_PRODUCTION_BUILD, CWD);
  const { pagesDir } = findPagesDir(CWD, !!nextConfig.experimental.appDir);
  config.module.rules = [
    ...filterModuleRules(config),
    ...nextWebpackConfig.module.rules.map((rule) => {
      // we need to resolve next-babel-loader since it's not available
      // relative with storybook's config
      if (rule.use && rule.use.loader === 'next-babel-loader') {
        rule.use.loader = require.resolve(
          'next/dist/build/webpack/loaders/next-babel-loader',
        );
      }
      return rule;
    }),
  ];

  return config;
}

const routes: Routes = [
  {
    path: '',
    component: AboutPage,
  },
];
