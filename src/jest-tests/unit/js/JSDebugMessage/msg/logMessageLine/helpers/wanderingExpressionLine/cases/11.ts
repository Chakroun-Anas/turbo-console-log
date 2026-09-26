// A throw that is the braceless body of an `if`: inserting before the throw
// would make the log the body and the throw unconditional. The log goes
// before the whole `if`.
export default {
  name: 'throw in a braceless if body is logged before the if',
  fileExtension: '.js',
  lines: [
    'async function getUser(id) {',
    '  const user = await User.findById(id);',
    '  if (!user)',
    '    throw new NotFoundError(`User ${id} not found`);',
    '  return user;',
    '}',
  ],
  selectionLine: 3,
  variableName: 'id',
  expectedLine: 2,
};
