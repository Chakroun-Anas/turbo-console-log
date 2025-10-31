export default {
  name: 'property access assignment inside function block',
  fileExtension: '.ts',
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
};
