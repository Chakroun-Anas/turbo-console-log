export const supportedExtensions = [
  'ts',
  'js',
  'tsx',
  'jsx',
  'mjs',
  'cjs',
  'mts',
  'cts',
  'vue',
  'svelte',
  'astro',
  'py',
  'php',
];

export const filesToWatch = `**/*.{${supportedExtensions.join(',')}}`;
export const folderWorkspaceTargetFiles = new RegExp(
  `\\.(${supportedExtensions.join('|')})$`,
);
