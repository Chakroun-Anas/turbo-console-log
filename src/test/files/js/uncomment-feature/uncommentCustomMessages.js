const person = {
    fullName: 'John Doe',
    age: 25,
    address: {
        city: 'New York',
        state: 'NY'
    }
}

// fancy.debug.func('🚀 ~ uncommentCustomMessages.js:9 ~ person:', person);

const isMarried = true;

// fancy.debug.func('🚀 ~ uncommentCustomMessages.js:13 ~ isMarried:', isMarried);

function sayHello(person) {
    // fancy.debug.func('🚀 ~ uncommentCustomMessages.js:16 ~ sayHello ~ person:', person);
    console.log(`Hello ${person.fullName}`)
}
