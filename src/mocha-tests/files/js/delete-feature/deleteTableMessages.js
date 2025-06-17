const users = [
  { id: 1, name: 'John', age: 25 },
  { id: 2, name: 'Sarah', age: 30 },
  { id: 3, name: 'Mike', age: 35 }
];
console.table('🚀 ~ deleteTableMessages.js:5 ~ users:', users);
function filterUsers(minAge) {
  const filteredUsers = users.filter(user => user.age >= minAge);
  console.table('🚀 ~ deleteTableMessages.js:9 ~ filterUsers ~ filteredUsers:', filteredUsers);
  return filteredUsers;
}
const products = [
  { id: 101, name: 'Laptop', price: 999 },
  { id: 102, name: 'Phone', price: 699 }
];
console.table('🚀 ~ deleteTableMessages.js:17 ~ products:', products);
filterUsers(30);
