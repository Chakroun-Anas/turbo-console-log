// @ts-nocheck
function getUsers() {
    $scope.isLoadingData = true
    var promise = UsersFactory.getUsers()
    promise.then(function (data) {
        $scope.users = data.data.result;
        $scope.isLoadingData = false
    }).catch(function (error) {
        $scope.isLoadingData = false
    })
}