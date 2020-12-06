// @ts-nocheck

type Person = {
  fullName: string;
  age: number;
  isMarried: boolean;
  something: boolean;
  anotherThing: string;
  thirdThing: number;
};

function logPersonInfo(person: Person) {
  const {
    fullName,
    age,
    isMarried,
    something,
    anotherThing,
    thirdThing,
  } = person;
  return true;
}
