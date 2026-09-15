export default {
  fileExtension: '.ts',
  name: 'block callback parameter named like a property read by a same-line getter',
  lines: [
    'watch(() => route.params.id, async (id) => {',
    '  await load(id);',
    '});',
  ],
  selectionLine: 0,
  variableName: 'id',
};
