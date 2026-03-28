// Fake Mongoose Model for User without requiring MongoDB
const users = [];
let idCounter = 1;

const User = {
  create: async (data) => {
    const newUser = { _id: String(idCounter++), ...data, createdAt: new Date(), updatedAt: new Date() };
    users.push(newUser);
    return newUser;
  },
  findOne: async (query) => {
    return users.find(u => {
      let match = true;
      for (const key in query) {
        if (u[key] !== query[key]) match = false;
      }
      return match;
    }) || null;
  },
  find: async () => {
    return users;
  }
};

module.exports = User;