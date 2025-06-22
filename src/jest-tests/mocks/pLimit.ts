const pLimit = jest.fn(() => {
  return jest.fn(async function (fn, ...args) {
    return fn(...args);
  });
});

module.exports = {
  __esModule: true,
  default: pLimit,
};
