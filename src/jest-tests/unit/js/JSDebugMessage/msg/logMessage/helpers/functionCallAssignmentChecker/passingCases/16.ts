export default {
  name: 'class property initialized with new expression',
  fileExtension: '.ts',
  lines: [
    'class BackendService {',
    '  protected config: InMemoryBackendConfigArgs = new InMemoryBackendConfig();',
    '  protected db: {[key: string]: any} = {};',
    '}',
  ],
  selectionLine: 1,
  variableName: 'config',
};
