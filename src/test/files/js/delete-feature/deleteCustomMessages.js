const settings = { theme: 'dark', notifications: true };
fancy.debug.func('🚀 ~ deleteCustomMessages.js:2 ~ settings:', settings);
function updatePreferences(preferences) {
  fancy.debug.func('🚀 ~ deleteCustomMessages.js:5 ~ updatePreferences ~ preferences:', preferences);
  return { ...settings, ...preferences };
}
