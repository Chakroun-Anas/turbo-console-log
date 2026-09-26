export default {
  name: 'destructured binding of a yield call',
  fileExtension: '.js',
  lines: [
    'function* fetchUserSaga(action) {',
    '  const { data } = yield call(api.fetchUser, action.payload.id);',
    '}',
  ],
  selectionLine: 1,
  variableName: 'data',
};
