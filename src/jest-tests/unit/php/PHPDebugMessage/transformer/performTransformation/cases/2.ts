export default {
  name: 'empty function declaration',
  lines: ['<?php', 'function sayHello($person) {}'],
  line: 1,
  selectedVar: 'person',
  debuggingMsg: 'error_log("person: " . print_r($person, true));',
  expected: [
    '<?php',
    'function sayHello($person) {',
    '  error_log("person: " . print_r($person, true));',
    '}',
  ],
};
