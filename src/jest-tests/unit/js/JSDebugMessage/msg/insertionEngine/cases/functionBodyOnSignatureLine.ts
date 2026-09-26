import { InsertionEngineCase } from './types';

// Parameters are logged on the first line of the body. When the body opens (and
// closes) on the signature line there is no whole line inside it, so the
// insertion must go through the transformer, as it already does for empty
// function declarations and class methods.
export const functionBodyOnSignatureLineCases: InsertionEngineCase[] = [
  {
    name: 'parameter of a one-line setter body goes through the transformer',
    fileExtension: '.ts',
    lines: [
      'export class ToggleComponent {',
      '  private _checked = false;',
      '  set checked(value: boolean) { this._checked = value; }',
      '}',
    ],
    selectionLine: 2,
    variableName: 'value',
    expectedLine: 2,
    expectsTransformation: true,
  },
  {
    name: 'parameter of a one-line class-field arrow block body goes through the transformer',
    fileExtension: '.ts',
    lines: [
      'export class DialogComponent {',
      '  onClose = (reason: string) => { this.closed.emit(reason); };',
      '}',
    ],
    selectionLine: 1,
    variableName: 'reason',
    expectedLine: 1,
    expectsTransformation: true,
  },
  {
    name: 'parameter of a one-line type-guard function body goes through the transformer',
    fileExtension: '.ts',
    lines: [
      'export function isDefined<T>(value: T | undefined): value is T { return value !== undefined; }',
      'use(isDefined);',
    ],
    selectionLine: 0,
    variableName: 'value',
    expectedLine: 0,
    expectsTransformation: true,
  },
  {
    name: 'parameter of an empty object-literal method stub goes through the transformer',
    fileExtension: '.vue',
    lines: [
      '<script>',
      'export default {',
      '  methods: {',
      '    onBlur(event) {},',
      '    onFocus() {',
      '      this.focused = true;',
      '    },',
      '  },',
      '};',
      '</script>',
    ],
    selectionLine: 3,
    variableName: 'event',
    expectedLine: 3,
    expectsTransformation: true,
  },
  {
    name: 'parameter of an empty arrow block body goes through the transformer',
    fileExtension: '.vue',
    lines: [
      '<script setup lang="ts">',
      'const onSubmit = (event: SubmitEvent) => {};',
      'const onReset = () => {',
      "  form.value = '';",
      '};',
      '</script>',
    ],
    selectionLine: 1,
    variableName: 'event',
    expectedLine: 1,
    expectsTransformation: true,
  },
  {
    name: 'parameter of an empty function declaration goes through the transformer',
    fileExtension: '.ts',
    lines: ['function onBlur(event) {}', 'use(onBlur);'],
    selectionLine: 0,
    variableName: 'event',
    expectedLine: 1,
    expectsTransformation: true,
  },
  {
    name: 'parameter property of an empty constructor goes through the transformer',
    fileExtension: '.ts',
    lines: [
      'class A {',
      '  constructor(private readonly http: HttpClient) {}',
      '}',
    ],
    selectionLine: 1,
    variableName: 'http',
    expectedLine: 2,
    expectsTransformation: true,
  },
  {
    name: 'parameter of a multi-line block arrow is logged at the top of the body',
    fileExtension: '.ts',
    lines: ['const handler = (event) => {', '  submit(event);', '};'],
    selectionLine: 0,
    variableName: 'event',
    expectedLine: 1,
  },
];
