export default {
  fileExtension: '.ts',
  name: 'constructor parameter with access modifier and empty body',
  lines: ['class UserService {', '  constructor(private name: string) {}', '}'],
  selectedVar: 'name',
  line: 1,
  debuggingMsg: 'console.log("DEBUG");',
  expected: [
    'class UserService {',
    '  constructor(private name: string) {',
    '    console.log("DEBUG");',
    '  }',
    '}',
  ],
};
