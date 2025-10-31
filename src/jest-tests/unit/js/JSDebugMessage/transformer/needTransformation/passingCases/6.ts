export default {
  fileExtension: '.ts',
  name: 'arrow function with destructured parameter - wallpaper case',
  lines: [
    'WALLPAPER_PATHS[wallpaperName]()',
    '  .then(({ default: wallpaper }) =>',
    '    wallpaper?.(desktopRef.current, config, fallbackWallpaper)',
    '  )',
    '  .catch(fallbackWallpaper);',
  ],
  selectionLine: 1, // Line with wallpaper parameter declaration
  variableName: 'wallpaper',
};
