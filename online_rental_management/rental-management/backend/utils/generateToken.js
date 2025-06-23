const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, 'your_jwt_secret_key', {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
