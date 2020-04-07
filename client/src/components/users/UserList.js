import React from 'react';
import { useSubscription } from '@apollo/react-hooks';

import gql from 'graphql-tag';

const GET_LOGGED_IN_USERS = gql`
  query GetLoggedInusers {
    loggedInUsers {
      _id
      username
    }
  }
`;

const USER_LOGGED_EVENT = gql`
  subscription UserLoggedEvent {
    userLoggedEvent {
      loggedIn
      user {
        _id
        username
      }
    }
  }
`;

export default ({ users }) => {
  useSubscription(
    USER_LOGGED_EVENT,
    {
      onSubscriptionData({ subscriptionData: { data: { userLoggedEvent } }, client }) {
        const data = client.readQuery({ query: GET_LOGGED_IN_USERS });
        let loggedInUsers = data.loggedInUsers;
        const userId = userLoggedEvent.user._id;

        if (userLoggedEvent.loggedIn) {
          for (let i = 0; i < loggedInUsers.length; i++) {
            if (loggedInUsers[i]._id === userId) return;
          }
          loggedInUsers = loggedInUsers.concat([userLoggedEvent.user]);
        } else {
          loggedInUsers = loggedInUsers.filter(user => user._id !== userId);
        }

        client.writeQuery({ query: GET_LOGGED_IN_USERS, data: { loggedInUsers } });
      }
    }
  );

  return (
    <ul>
      {users.map(user => (
        <li key={user._id}>
          {user.username}
        </li>
      ))}
    </ul>
  )
}