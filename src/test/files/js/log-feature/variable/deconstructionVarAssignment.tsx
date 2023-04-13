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

const something = Object.call((props) => {
  const { coms } = props;
  return (
    <div>
      <p>Hello</p>
    </div>
  );
});
