export default {
  name: 'empty method declaration',
  lines: ['<?php', 'class User {', '  public function setName($name) {}', '}'],
  line: 2,
  selectedVar: 'name',
  debuggingMsg: 'error_log("name: " . print_r($name, true));',
  expected: [
    '<?php',
    'class User {',
    '  public function setName($name) {',
    '    error_log("name: " . print_r($name, true));',
    '  }',
    '}',
  ],
};
