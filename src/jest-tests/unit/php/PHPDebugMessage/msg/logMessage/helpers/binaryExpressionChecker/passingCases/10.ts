export default {
  name: 'string concatenation with multi-line',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$fullName = $firstName',
    '  . " "',
    '  . $middleName',
    '  . " "',
    '  . $lastName;',
  ],
  selectionLine: 1,
  variableName: '$firstName . " " . $middleName . " " . $lastName',
};
