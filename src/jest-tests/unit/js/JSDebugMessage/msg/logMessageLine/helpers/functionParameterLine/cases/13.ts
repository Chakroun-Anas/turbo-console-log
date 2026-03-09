export default {
  fileExtension: '.ts',
  name: 'constructor parameter with empty body',
  lines: ['class UserService {', '  constructor(private name: string) {}', '}'],
  selectionLine: 1,
  variableName: 'name',
  expected: 2,
};
