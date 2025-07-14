import { propertyAccessAssignmentChecker } from '@/debug-message/js/JSDebugMessage/logMessage/helpers/propertyAccessAssignmentChecker';
import { makeTextDocument } from '@/jest-tests/mocks/helpers/';

describe('propertyAccessAssignmentChecker – property access via AST', () => {
  const cases = [
    {
      name: 'optional chaining on workspace folders',
      lines: [
        'const currentRoot = vscode.workspace?.workspaceFolders?.[0]?.uri.fsPath;',
      ],
      selectionLine: 0,
      variableName: 'currentRoot',
      expected: true,
    },
    {
      name: 'nested property access',
      lines: ['const userName = user.profile.name;'],
      selectionLine: 0,
      variableName: 'userName',
      expected: true,
    },
    {
      name: 'element access with number',
      lines: ['const firstItem = list[0].title;'],
      selectionLine: 0,
      variableName: 'firstItem',
      expected: true,
    },
    {
      name: 'deep element and property access',
      lines: ['const value = config.sections[2].options.label;'],
      selectionLine: 0,
      variableName: 'value',
      expected: true,
    },
    {
      name: 'element access with string and property',
      lines: ['const status = obj["status"].label;'],
      selectionLine: 0,
      variableName: 'status',
      expected: true,
    },
    {
      name: 'classic env access',
      lines: ['const env = process.env.NODE_ENV;'],
      selectionLine: 0,
      variableName: 'env',
      expected: true,
    },
    {
      name: 'element access with string literal',
      lines: ['const log = logger["log"];'],
      selectionLine: 0,
      variableName: 'log',
      expected: true,
    },
    {
      name: 'property access assignment inside function block',
      lines: [
        'function getUsers() {', // 0
        '  $scope.isLoadingData = true;', // 1
        '  var promise = UsersFactory.getUsers();', // 2
        '  promise.then(function (data) {', // 3
        '    $scope.users = data.data.result;', // 4 <- selection line
        '    $scope.isLoadingData = false;', // 5
        '  }).catch(function (error) {', // 6
        '    $scope.isLoadingData = false;', // 7
        '  });', // 8
        '  console.log("🚀 ~ $scope.users:", $scope.users);', // 9
        '}',
      ],
      selectionLine: 4,
      variableName: '$scope.users',
      expected: true,
    },
    {
      name: 'function call assignment – should be rejected',
      lines: ['const data = fetchData();'],
      selectionLine: 0,
      variableName: 'data',
      expected: false,
    },
    {
      name: 'non-assignment line – should be rejected',
      lines: ['function sayHello(person: Person) {'],
      selectionLine: 0,
      variableName: 'sayHello',
      expected: false,
    },
  ];

  for (const test of cases) {
    it(`should detect correctly – ${test.name}`, () => {
      const doc = makeTextDocument(test.lines);
      const result = propertyAccessAssignmentChecker(
        doc,
        test.selectionLine,
        test.variableName,
      );
      expect(result.isChecked).toBe(test.expected);
    });
  }
});
