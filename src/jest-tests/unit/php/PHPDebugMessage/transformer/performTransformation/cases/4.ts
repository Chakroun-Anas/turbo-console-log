export default {
  name: 'empty constructor',
  lines: [
    '<?php',
    'class User {',
    '  public function __construct($name) {}',
    '}',
  ],
  line: 2,
  selectedVar: 'name',
  debuggingMsg: 'error_log("name: " . print_r($name, true));',
  expected: [
    '<?php',
    'class User {',
    '  public function __construct($name) {',
    '    error_log("name: " . print_r($name, true));',
    '  }',
    '}',
  ],
};
