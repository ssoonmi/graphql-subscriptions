import React from 'react';
import { useSubscription, useQuery } from '@apollo/react-hooks';

import gql from 'graphql-tag';

const GET_MESSAGES = gql`
  query GetMessages {
    messages {
      _id
      body
      author {
        _id
        username
      }
    }
  }
`;

const MESSAGE_SUBSCRIPTION = gql`
  subscription MessageSubscription {
    publishMessage {
      _id
      body
      author {
        _id
        username
      }
    }
  }
`;

export default () => {
  const { data, loading, error } = useQuery(GET_MESSAGES);
  useSubscription(
    MESSAGE_SUBSCRIPTION,
    {
      onSubscriptionData({ subscriptionData: { data: { publishMessage } }, client }) {
        if (!publishMessage) return;
        const messages = data.messages.concat([publishMessage]);
        client.writeQuery({ query: GET_MESSAGES, data: { messages } });
      }
    }
  );
  if (loading) return 'Loading';
  if (error) return 'ERROR';
  
  return (
    <ul>
      {data && data.messages && data.messages.map(message => (
        <li key={message._id}>
          {message.body}
          by: {message.author.username}
        </li>
      ))}
    </ul>
  )
}