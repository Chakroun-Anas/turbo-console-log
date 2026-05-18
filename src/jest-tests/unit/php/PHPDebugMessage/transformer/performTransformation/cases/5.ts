export default {
  name: 'arrow function with complex expression (no captured vars)',
  lines: ['<?php', '$calculate = fn($a, $b) => $a + $b * 2;'],
  line: 1,
  selectedVar: 'a',
  debuggingMsg: 'error_log("a: " . print_r($a, true));',
  expected: [
    '<?php',
    '$calculate = function($a, $b) {',
    '  error_log("a: " . print_r($a, true));',
    '  return $a + $b * 2;',
    '};',
  ],
};
