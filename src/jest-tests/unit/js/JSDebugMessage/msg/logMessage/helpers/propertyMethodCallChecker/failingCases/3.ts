export default {
  name: 'should NOT match identifier inside return statement body',
  fileExtension: '.ts',
  lines: [
    'function stripBlock(messagePart: string, rawMessagePart: string) {',
    '  return rawMessagePart.charAt(0) === BLOCK_MARKER',
    '    ? messagePart.substring(findEndOfBlock(messagePart, rawMessagePart) + 1)',
    '    : messagePart;',
    '}',
  ],
  selectionLine: 1,
  selectedText: 'rawMessagePart',
};
