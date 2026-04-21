export default {
  name: 'logical AND with multi-line',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$result = $isActive',
    '  && $hasPermission',
    '  && $isVerified;',
  ],
  selectionLine: 1,
  variableName: '$isActive && $hasPermission && $isVerified',
};
