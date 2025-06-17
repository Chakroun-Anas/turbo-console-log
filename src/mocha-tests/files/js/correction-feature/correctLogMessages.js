const person = {
  fullName: 'John Doe',
  age: 25,
  address: {
    city: 'New York',
    state: 'NY',
  },
};

// Outdated log message: incorrect filename and line number
console.log('🚀 ~ oldFile.js:5 ~ person:', person);

const isMarried = true;

// Outdated log message: incorrect filename and line number
console.log('🚀 ~ oldFile.js:8 ~ isMarried:', isMarried);

function sayHello(person) {
  // Outdated log message: incorrect filename and line number
  console.log('🚀 ~ oldFile.js:11 ~ sayHello ~ person:', person);
  console.log(`Hello ${person.fullName}`);
}
