export default {
  fileExtension: '.ts',
  name: 'constructor parameter with access modifier (class property)',
  lines: [
    'export class SomeClass {',
    '  constructor(',
    '    protected firstDependency: Segments,',
    '    protected secondDependency: SegmentProviders',
    '  ) {}',
    '}',
  ],
  selectionLine: 2,
  variableName: 'firstDependency',
};
