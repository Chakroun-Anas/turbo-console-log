export default {
  name: 'comparison with multi-line',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$isValid = $age > 18',
    '  && $score >= 70',
    '  && $status == "active";',
  ],
  selectionLine: 1,
  variableName: '$age > 18 && $score >= 70 && $status == "active"',
};
