const axios = {
  get: jest.fn(),
  post: jest.fn(),
  create: () => axios,
};

export default axios;
