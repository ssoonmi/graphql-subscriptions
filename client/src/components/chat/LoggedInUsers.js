import React from 'react';
import { useSubscription, useQuery } from '@apollo/react-hooks';

import gql from 'graphql-tag';
import UserList from '../users/UserList';

const GET_LOGGED_IN_USERS = gql`
  query GetLoggedInusers {
    loggedInUsers {
      _id
      username
    }
  }
`;

export default () => {
  const { data, loading, error } = useQuery(
    GET_LOGGED_IN_USERS
  );

  if (loading) return 'Loading';
  if (error) return 'Error';

  return (
    <>
      Active Users
      {data && data.loggedInUsers && <UserList users={data.loggedInUsers} />}
    </>
  )
}