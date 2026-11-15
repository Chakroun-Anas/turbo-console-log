export default {
  fileExtension: '.js',
  name: 'arrow with its multi-line body on the next line: the body is not shifted twice',
  lines: [
    'const create = (user) =>',
    '  api.post({',
    '    id: user.id,',
    '  });',
  ],
  selectedVar: 'user',
  line: 0,
  debuggingMsg: '  console.log("user", user);',
  expected: [
    'const create = (user) => {',
    '  console.log("user", user);',
    '  return api.post({',
    '    id: user.id,',
    '  });',
    '};',
  ],
};
