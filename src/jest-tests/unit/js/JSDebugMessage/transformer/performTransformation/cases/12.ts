export default {
  fileExtension: '.ts',
  name: 'empty arrow block body',
  lines: ['const onSubmit = (event: SubmitEvent) => {};'],
  selectedVar: 'event',
  line: 0,
  debuggingMsg: 'console.log("DEBUG")',
  expected: [
    'const onSubmit = (event: SubmitEvent) => {',
    '  console.log("DEBUG");',
    '};',
  ],
};
