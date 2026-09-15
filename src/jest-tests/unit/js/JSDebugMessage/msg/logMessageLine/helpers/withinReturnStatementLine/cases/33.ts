// Inner return of a curried middleware nested in an outer return
export default {
  name: 'inner return of a closure nested in an outer return',
  fileExtension: '.js',
  lines: [
    'const loadPost = (Model) => {',
    '  return async (req, res, next) => {',
    '    const post = await Model.findById(req.params.id);',
    '    if (!post) {',
    '      return res.status(404).json({ id: req.params.id });',
    '    }',
    '    next();',
    '  };',
    '};',
  ],
  selectionLine: 4,
  variableName: 'req.params.id',
  expected: 4,
};
