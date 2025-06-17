function sayHello(person) {
  return `Hello, ${person.name}`;
}

function testMultiLineReturn(firstValue, secondValue) {
    return (
      true
        ? firstValue
        : secondValue
    );
  }