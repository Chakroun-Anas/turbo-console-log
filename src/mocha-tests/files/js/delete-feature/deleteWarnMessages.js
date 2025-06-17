const age = 30;
console.warn('🚀 ~ deleteWarnMessages.js:2 ~ age:', age);
function sayHello(person) {
  console.warn('🚀 ~ deleteWarnMessages.js:5 ~ sayHello ~ person:', person);
  return `Hello, ${person}`;
}

const person = "John";
console.warn('🚀 ~ deleteWarnMessages.js:10 ~ person:', person);
sayHello(person);
