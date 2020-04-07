const { makeExecutableSchema } = require('graphql-tools');
const gql = require('graphql-tag');
const { merge } = require('lodash');
const types = require('./types');

const otherTypes = gql`
  type Query {
    _: String
  }
  type Mutation {
    _: String
  }
  type Subscription {
    _: String
  }
  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
`;

const otherResolvers = {

};

const typeDefs = [...types.map(type => type.typeDefs), otherTypes];

const resolvers = merge(...types.map(type => type.resolvers), otherResolvers);

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

module.exports = {
  schema,
  typeDefs,
  resolvers
}