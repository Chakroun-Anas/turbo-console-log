const person = {
  fullName: 'John Doe',
  age: 25,
  address: {
    city: 'New York',
    state: 'NY',
  },
};

console.table('🚀 ~ commentTableMessages.js:10 ~ person:', person);

const isMarried = true;

console.table('🚀 ~ commentTableMessages.js:14 ~ isMarried:', isMarried);

function sayHello(person) {
  console.table('🚀 ~ commentTableMessages.js:17 ~ sayHello ~ person:', person);
  console.debug(`Hello ${person.fullName}`);
}
