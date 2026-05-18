export default {
  name: 'logical OR with multi-line',
  fileExtension: '.php',
  lines: [
    '<?php',
    '$canAccess = $isAdmin',
    '  || $isOwner',
    '  || $isModerator;',
  ],
  selectionLine: 1,
  variableName: '$isAdmin || $isOwner || $isModerator',
};
