const person = {
  fullName: 'John Doe',
  age: 25,
  address: {
    city: 'New York',
    state: 'NY',
  },
};

// Outdated debug log message: incorrect filename and line number
console.debug('🚀 ~ oldFile.js:10 ~ person:', person);

const isMarried = true;

// Outdated debug log message: incorrect filename and line number
console.debug('🚀 ~ oldFile.js:15 ~ isMarried:', isMarried);

function sayHello(person) {
  // Outdated debug log message: incorrect filename and line number
  console.debug('🚀 ~ oldFile.js:22 ~ sayHello ~ person:', person);
  console.log(`Hello ${person.fullName}`);
}
