export default {
  name: 'arrow function to anonymous function (no captured vars)',
  lines: ['<?php', '$double = fn($x) => $x * 2;'],
  line: 1,
  selectedVar: 'x',
  debuggingMsg: 'error_log("x: " . print_r($x, true));',
  expected: [
    '<?php',
    '$double = function($x) {',
    '  error_log("x: " . print_r($x, true));',
    '  return $x * 2;',
    '};',
  ],
};
