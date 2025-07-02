import { propertyAccessAssignmentChecker } from '../../../../../../debug-message/js/JSDebugMessage/logMessage/helpers/';
import { LineCodeProcessing } from '../../../../../../line-code-processing';

describe('propertyAccessAssignmentChecker', () => {
  it('detects valid property access assignment', () => {
    const validLines = [
      'const currentRoot = vscode.workspace?.workspaceFolders?.[0]?.uri.fsPath;',
      'const userName = user.profile.name;',
      'const firstItem = list[0].title;',
      'const value = config.sections[2].options.label;',
      'const status = obj["status"].label;',
      'const env = process.env.NODE_ENV;',
      'const log = logger["log"];',
    ];
    const lineCodeProcessingMock = {
      isAssignedToVariable: jest.fn().mockReturnValue(true),
    } as unknown as LineCodeProcessing;
    for (const validLine of validLines) {
      const result = propertyAccessAssignmentChecker(
        lineCodeProcessingMock,
        validLine,
      );
      expect(result.isChecked).toBe(true);
    }
  });

  it('rejects function call assignment', () => {
    const line = 'const data = fetchData();';

    const lineCodeProcessingMock = {
      isAssignedToVariable: jest.fn().mockReturnValueOnce(true),
    } as unknown as LineCodeProcessing;

    const result = propertyAccessAssignmentChecker(
      lineCodeProcessingMock,
      line,
    );
    expect(result.isChecked).toBe(false);
  });

  it('bails if isAssignedToVariable returns false', () => {
    const line = 'function sayHello(person: Person) {';

    const lineCodeProcessingMock = {
      isAssignedToVariable: jest.fn().mockReturnValueOnce(false),
    } as unknown as LineCodeProcessing;

    const result = propertyAccessAssignmentChecker(
      lineCodeProcessingMock,
      line,
    );
    expect(result.isChecked).toBe(false);
  });
});
