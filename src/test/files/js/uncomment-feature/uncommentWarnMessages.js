const person = {
  fullName: 'John Doe',
  age: 25,
  address: {
    city: 'New York',
    state: 'NY',
  },
};

// console.warn('🚀 ~ uncommentWarnMessages.js:10 ~ person:', person);

const isMarried = true;

// console.warn('🚀 ~ uncommentWarnMessages.js:14 ~ isMarried:', isMarried);

function sayHello(person) {
  // console.warn('🚀 ~ uncommentWarnMessages.js:17 ~ sayHello ~ person:', person);
  console.debug(`Hello ${person.fullName}`);
}
