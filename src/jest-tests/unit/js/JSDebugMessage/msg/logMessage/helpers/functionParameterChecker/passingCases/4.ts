export default {
  name: 'nested object destructured parameter',
  fileExtension: '.ts',
  lines: [
    'const handleInit = ({ config: { apiKey, region } }) => {',
    '  console.log(apiKey);',
    '};',
  ],
  selectionLine: 0,
  variableName: 'apiKey',
};
