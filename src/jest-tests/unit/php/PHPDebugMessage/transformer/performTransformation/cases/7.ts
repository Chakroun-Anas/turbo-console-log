export default {
  name: 'arrow function with multiple captured variables',
  lines: [
    '<?php',
    '$multiplier = 10;',
    '$offset = 5;',
    '$calc = fn($x) => $x * $multiplier + $offset;',
  ],
  line: 3,
  selectedVar: 'x',
  debuggingMsg: 'error_log("x: " . print_r($x, true));',
  expected: [
    '<?php',
    '$multiplier = 10;',
    '$offset = 5;',
    '$calc = function($x) use ($multiplier, $offset) {',
    '  error_log("x: " . print_r($x, true));',
    '  return $x * $multiplier + $offset;',
    '};',
  ],
};
