import { createReleasePanelStatusBarItem } from '../../../helpers/createReleasePanelStatusBarItem';

describe('createReleasePanelStatusBarItem', () => {
  it('shows the rocket text and the What’s New tooltip for the version', () => {
    const item = createReleasePanelStatusBarItem('3.29.0');

    expect(item.text).toBe('$(rocket) Turbo v3.29.0');
    expect(item.tooltip).toBe("What's New in Turbo Console Log v3.29.0");
  });

  it('opens the release panel when clicked and shows the item', () => {
    const item = createReleasePanelStatusBarItem('3.29.0');

    expect(item.command).toBe('turboConsoleLog.showReleasePanel');
    expect(item.show).toHaveBeenCalled();
  });

  it('never schedules a timer, since there is no campaign countdown', () => {
    const setIntervalSpy = jest.spyOn(global, 'setInterval');

    createReleasePanelStatusBarItem('3.29.0');

    expect(setIntervalSpy).not.toHaveBeenCalled();
    setIntervalSpy.mockRestore();
  });
});
