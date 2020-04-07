const gql = require('graphql-tag');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Message = mongoose.model('Message');
const { MESSAGE_CREATED } = require('../../subscriptions');

const typeDefs = gql`
  extend type Query {
    messages: [Message]
  }
  extend type Mutation {
    createMessage(input: CreateMessageInput!): CreateMessageResponse
  }
  extend type Subscription {
    publishMessage: Message
  }
  type Message {
    _id: ID!
    body: String!
    author: User!
  }
  input CreateMessageInput {
    body: String!
  }
  type CreateMessageResponse {
    success: Boolean!
    message: Message!
  }
`;

const resolvers = {
  Query: {
    messages(_, __) {
      return Message.find({});
    }
  },
  Mutation: {
    createMessage: async (_, { input: { body }}, context) => {
      if (!context.user) throw new Error('User must be logged in to write message');
      const message = new Message({ body, author: context.user._id });
      await message.save();
      context.pubsub.publish(MESSAGE_CREATED, { publishMessage: message });
      return {
        success: true,
        message
      }
    }
  },
  Subscription: {
    publishMessage: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator(MESSAGE_CREATED)
    }
  },
  Message: {
    author(message) {
      return User.findById(message.author);
    }
  }
};

module.exports = {
  typeDefs,
  resolvers
}