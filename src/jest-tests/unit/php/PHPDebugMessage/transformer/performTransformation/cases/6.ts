export default {
  name: 'arrow function with captured variables',
  lines: [
    '<?php',
    '$multiplier = 10;',
    '$double = fn($x) => $x * $multiplier;',
  ],
  line: 2,
  selectedVar: 'x',
  debuggingMsg: 'error_log("x: " . print_r($x, true));',
  expected: [
    '<?php',
    '$multiplier = 10;',
    '$double = function($x) use ($multiplier) {',
    '  error_log("x: " . print_r($x, true));',
    '  return $x * $multiplier;',
    '};',
  ],
};
