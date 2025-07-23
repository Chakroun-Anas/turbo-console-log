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

  it('apply formatting values when default config is altered', () => {
    const config = createMockWorkspaceConfig({
      logMessagePrefix: '',
      delimiterInsideMessage: '',
      logMessageSuffix: '',
    });
    const props = getExtensionProperties(config);
    expect(props.logMessagePrefix).toBe('🚀');
    expect(props.delimiterInsideMessage).toBe('~');
    expect(props.logMessageSuffix).toBe(':');
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

  it('respects explicit false values for boolean properties', () => {
    const config = createMockWorkspaceConfig({
      insertEnclosingClass: false,
      insertEnclosingFunction: false,
    });

    const props = getExtensionProperties(config);

    expect(props.insertEnclosingClass).toBe(false);
    expect(props.insertEnclosingFunction).toBe(false);
  });
});
