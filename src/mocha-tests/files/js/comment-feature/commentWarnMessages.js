const person = {
  fullName: 'John Doe',
  age: 25,
  address: {
    city: 'New York',
    state: 'NY',
  },
};

console.warn('🚀 ~ commentWarnMessages.js:10 ~ person:', person);

const isMarried = true;

console.warn('🚀 ~ commentWarnMessages.js:14 ~ isMarried:', isMarried);

function sayHello(person) {
  console.warn('🚀 ~ commentWarnMessages.js:17 ~ sayHello ~ person:', person);
  console.debug(`Hello ${person.fullName}`);
}
