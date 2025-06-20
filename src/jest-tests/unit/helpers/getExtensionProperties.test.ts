import { getExtensionProperties } from '../../../helpers';
import { createMockWorkspaceConfig } from '../../mocks';

describe('getExtensionProperties', () => {
  it('returns default values when config is empty', () => {
    const config = createMockWorkspaceConfig({});
    const props = getExtensionProperties(config);

    expect(props.wrapLogMessage).toBe(false);
    expect(props.logMessagePrefix).toBe('🚀');
    expect(props.addSemicolonInTheEnd).toBe(false);
  });

  it('uses provided overrides', () => {
    const config = createMockWorkspaceConfig({
      wrapLogMessage: true,
      logMessagePrefix: '🔥',
      logType: 'info',
    });

    const props = getExtensionProperties(config);

    expect(props.wrapLogMessage).toBe(true);
    expect(props.logMessagePrefix).toBe('🔥');
    expect(props.logType).toBe('info');
  });
});
