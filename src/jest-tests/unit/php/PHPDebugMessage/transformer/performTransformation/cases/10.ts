export default {
  name: 'arrow function with object property (should only capture base $obj)',
  lines: ['<?php', '$fn = fn($x) => $x + $obj->prop + $obj->other;'],
  line: 1,
  selectedVar: 'x',
  debuggingMsg: 'error_log("x: " . print_r($x, true));',
  expected: [
    '<?php',
    '$fn = function($x) use ($obj) {',
    '  error_log("x: " . print_r($x, true));',
    '  return $x + $obj->prop + $obj->other;',
    '};',
  ],
};
