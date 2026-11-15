export default {
  fileExtension: '.jsx',
  name: 'arrow returning parenthesized multi-line JSX: the JSX is not shifted twice',
  lines: [
    'const Card = ({ title }) => (',
    '  <div>',
    '    {title}',
    '  </div>',
    ');',
  ],
  selectedVar: 'title',
  line: 0,
  debuggingMsg: '  console.log("title", title);',
  expected: [
    'const Card = ({ title }) => {',
    '  console.log("title", title);',
    '  return <div>',
    '    {title}',
    '  </div>;',
    '};',
  ],
};
