const person = {
  fullName: 'John Doe',
  age: 25,
  address: {
    city: 'New York',
    state: 'NY',
  },
};

// console.error('🚀 ~ uncommentErrorMessages.js:10 ~ person:', person);

const isMarried = true;

// console.error('🚀 ~ uncommentErrorMessages.js:14 ~ isMarried:', isMarried);

function sayHello(person) {
  // console.error('🚀 ~ uncommentErrorMessages:17 ~ sayHello ~ person:', person);
  console.debug(`Hello ${person.fullName}`);
}
