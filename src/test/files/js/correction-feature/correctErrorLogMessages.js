const error = new Error('Something went wrong');

// Outdated error log message: incorrect filename and line number
console.error('🚀 ~ correctErrorLogMessages.js:5 ~ error:', error);

const failureRate = 15;

// Outdated error log message: incorrect filename and line number
console.error('🚀 ~ correctErrorLogMessages.js:8 ~ failureRate:', failureRate);

function processError(errorObj) {
  // Outdated error log message: incorrect filename and line number
  console.error('🚀 ~ correctErrorLogMessages.js:13 ~ processError ~ errorObj:', errorObj);
  return `Error processed: ${errorObj.message}`;
}
