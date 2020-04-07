const graphqlHTTP = require('express-graphql');

const graphqlLogger = (shouldLog) => (req, res, next) => {
  if (!shouldLog) {
    next();
    return;
  };
  graphqlHTTP.getGraphQLParams(req).then(({ query, variables, operationName }) => {
    res.on("finish", function () {
      const operation = operationName || 'no operation specified';
      console.log(
        "\x1b[36m%s%s\x1b[0m",
        `${new Date().toLocaleString("en-US")} - `,
        operation
      );
      console.group();
      if (query) console.log(query);
      if (variables) console.log("variables: ", variables);
      console.groupEnd();
    });
  });
  next();
};

const jwt = require('jsonwebtoken');
const secretOrKey = require('../config/keys').secretOrKey;
const mongoose = require('mongoose');
const User = mongoose.model('User');

async function authenticate(req, res, next) {
  const token = req.headers.authorization;
  const user = await verifyUser(token);
  if (user) req.user = user;
  return next();
}

async function verifyUser(token) {
  if (!token) return;
  const splitToken = token.split('Bearer ')[1];
  if (!splitToken) return;
  const decoded = jwt.verify(splitToken, secretOrKey);
  if (decoded && decoded._id) {
    const user = await User.findById(decoded._id);
    if (user) return user;
  }
  return;
}

module.exports = {
  graphqlLogger,
  authenticate,
  verifyUser
}