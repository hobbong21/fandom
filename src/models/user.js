const users = new Map();

function findByUsername(username) {
  return users.get(username) || null;
}

function create(username, hashedPassword) {
  if (users.has(username)) {
    throw new Error('User already exists');
  }
  const user = { username, password: hashedPassword };
  users.set(username, user);
  return user;
}

function _clear() {
  users.clear();
}

module.exports = { findByUsername, create, _clear };
