const user = { name: 'John', age: 30 };
console.debug('🚀 ~ deleteDebugMessages.js:2 ~ user:', user);
function processData(data) {
  console.debug('🚀 ~ deleteDebugMessages.js:5 ~ processData ~ data:', data);
  return data.map(item => item * 2);
}
