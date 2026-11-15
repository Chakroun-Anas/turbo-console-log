export default {
  fileExtension: '.js',
  name: 'arrow returning a multi-line call: the arguments move one level deeper',
  lines: ['const create = (user) => api.post({', '  id: user.id,', '});'],
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
