export default {
  name: 'arrow function with superglobal (should NOT capture $_GET)',
  lines: ['<?php', '$calc = fn($x) => $x + $_GET["multiplier"];'],
  line: 1,
  selectedVar: 'x',
  debuggingMsg: 'error_log("x: " . print_r($x, true));',
  expected: [
    '<?php',
    '$calc = function($x) {',
    '  error_log("x: " . print_r($x, true));',
    '  return $x + $_GET["multiplier"];',
    '};',
  ],
};
