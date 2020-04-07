const gql = require('graphql-tag');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Message = mongoose.model('Message');
const { USER_LOGGED_EVENT } = require('../../subscriptions');

const typeDefs = gql`
  extend type Query {
    loggedInUsers: [User]
    me: User
  }
  extend type Mutation {
    login(input: UserInput): UserCredentials
    signup(input: UserInput): UserCredentials
  }
  extend type Subscription {
    userLoggedEvent: UserLoggedEvent
  }
  type User {
    _id: ID!
    username: String!
  }
  input UserInput {
    username: String!
    password: String!
  }
  type UserCredentials {
    _id: ID!
    username: String!
    token: String
    loggedIn: Boolean
  }
  type UserLoggedEvent {
    user: User
    loggedIn: Boolean!
  }
`;

const resolvers = {
  Query: {
    loggedInUsers(_, __, context) {
      return context.pubsub.getUsers();
    },
    me(_, __, context) {
      return context.user;
    }
  },
  Mutation: {
    login(_, { input: { username, password } }) {
      return User.login(username, password);
    },
    signup(_, { input: { username, password } }) {
      return User.signup(username, password);
    }
  },
  Subscription: {
    userLoggedEvent: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(USER_LOGGED_EVENT)
    }
  }
};

module.exports = {
  typeDefs,
  resolvers
}