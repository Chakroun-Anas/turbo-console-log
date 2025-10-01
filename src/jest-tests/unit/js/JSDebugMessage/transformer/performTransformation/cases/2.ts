export default {
  name: 'empty function declaration',
  lines: ['function greet(name) {}'],
  selectedVar: 'name',
  line: 0,
  debuggingMsg: 'console.log("DEBUG");',
  expected: ['function greet(name) {', '  console.log("DEBUG");', '}'],
};
