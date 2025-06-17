const person = {
  fullName: 'John Doe',
  age: 25,
  address: {
    city: 'New York',
    state: 'NY',
  },
};

// Outdated warn log message: incorrect filename and line number
console.warn('🚀 ~ correctWarnLogMessages.js:10 ~ person:', person);

const isMarried = true;

// Outdated warn log message: incorrect filename and line number
console.warn('🚀 ~ correctWarnLogMessages.js:15 ~ isMarried:', isMarried);

function sayHello(person) {
  // Outdated warn log message: incorrect filename and line number
  console.warn('🚀 ~ correctWarnLogMessages.js:19 ~ sayHello ~ person:', person);
  console.log(`Hello ${person.fullName}`);
}
