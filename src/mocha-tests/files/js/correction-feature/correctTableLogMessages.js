const users = [
  { id: 1, name: 'John', age: 25 },
  { id: 2, name: 'Sarah', age: 30 },
  { id: 3, name: 'Mike', age: 35 }
];

// Outdated table log message: incorrect filename and line number
console.table('🚀 ~ correctTableLogMessages.js:6 ~ users:', users);

const products = [
  { id: 101, name: 'Laptop', price: 999 },
  { id: 102, name: 'Phone', price: 699 }
];

// Outdated table log message: incorrect filename and line number
console.table('🚀 ~ correctTableLogMessages.js:13 ~ products:', products);

function filterUsers(minAge) {
  const filteredUsers = users.filter(user => user.age >= minAge);
  // Outdated table log message: incorrect filename and line number
  console.table('🚀 ~ correctTableLogMessages.js:18 ~ filterUsers ~ filteredUsers:', filteredUsers);
  return filteredUsers;
}
