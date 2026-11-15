export default {
  fileExtension: '.js',
  name: 'wrapped log in a rewritten arrow: all three lines sit at the body indent',
  lines: [
    'export function loadProfile(id) {',
    '  return api.get(id).then((profile) => normalize(profile));',
    '}',
  ],
  selectedVar: 'profile',
  line: 1,
  debuggingMsg: [
    '  console.log("-----");',
    '  console.log("profile", profile);',
    '  console.log("-----");',
  ].join('\n'),
  expected: [
    'export function loadProfile(id) {',
    '  return api.get(id).then((profile) => {',
    '    console.log("-----");',
    '    console.log("profile", profile);',
    '    console.log("-----");',
    '    return normalize(profile);',
    '  });',
    '}',
  ],
};
