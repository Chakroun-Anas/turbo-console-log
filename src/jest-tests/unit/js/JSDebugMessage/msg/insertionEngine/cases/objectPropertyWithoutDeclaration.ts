import { InsertionEngineCase } from './types';

// Selecting a key inside an object literal that is not the initializer of a
// `const`/`let` declaration. With no declared root (returned, call argument,
// export default) the property's value is logged before the enclosing
// statement; with a member-assigned root (`this.state = {…}`) the member path
// is logged after the statement. Both used to fall back to
// `selectionLine + 1`, inside the literal or after a `return`.
export const objectPropertyWithoutDeclarationCases: InsertionEngineCase[] = [
  {
    name: 'key in a returned object literal logs its value before the return',
    fileExtension: '.ts',
    lines: [
      'function toDto(user) {',
      '  return {',
      '    id: user.id,',
      '    name: user.name,',
      '  };',
      '}',
    ],
    selectionLine: 2,
    variableName: 'id',
    expectedLine: 1,
    expectedDeepObjectPath: 'user.id',
  },
  {
    name: 'shorthand key in a returned object literal logs before the return',
    fileExtension: '.ts',
    lines: ['function toDto(id, name) {', '  return { id, name };', '}'],
    selectionLine: 1,
    variableName: 'id',
    expectedLine: 1,
  },
  {
    name: 'key in an object assigned to a member logs the member path after the statement',
    fileExtension: '.ts',
    lines: ['this.state = {', '  ready: true,', '};', 'next();'],
    selectionLine: 1,
    variableName: 'ready',
    expectedLine: 3,
    expectedDeepObjectPath: 'this.state.ready',
  },
  {
    name: 'key in module.exports logs the member path after the statement',
    fileExtension: '.js',
    lines: ['module.exports = {', '  a,', '};', ''],
    selectionLine: 1,
    variableName: 'a',
    expectedLine: 3,
    expectedDeepObjectPath: 'module.exports.a',
  },
  {
    name: 'key in an object passed as a call argument logs its value before the call',
    fileExtension: '.ts',
    lines: ['emit({', '  kind,', '});', 'next();'],
    selectionLine: 1,
    variableName: 'kind',
    expectedLine: 0,
  },
  {
    name: 'key in an export default object logs its value before the export',
    fileExtension: '.ts',
    lines: ['export default {', '  name,', '};', ''],
    selectionLine: 1,
    variableName: 'name',
    expectedLine: 0,
  },
];
