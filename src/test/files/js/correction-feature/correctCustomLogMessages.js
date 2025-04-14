const person = {
  fullName: 'John Doe',
  age: 25,
  address: {
    city: 'New York',
    state: 'NY',
  },
};

// Outdated custom log message: incorrect filename and line number
fancy.debug.func('🚀 ~ oldFile.js:10 ~ person:', person);

const isMarried = true;

// Outdated custom log message: incorrect filename and line number
fancy.debug.func('🚀 ~ oldFile.js:15 ~ isMarried:', isMarried);

function sayHello(person) {
  // Outdated custom log message: incorrect filename and line number
  fancy.debug.func('🚀 ~ oldFile.js:23 ~ sayHello ~ person:', person);
  console.log(`Hello ${person.fullName}`);
}
