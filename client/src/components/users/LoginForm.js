import React from 'react';

import gql from 'graphql-tag';
import SessionForm from './SessionForm';

const LOGIN_USER = gql`
  mutation LoginUser($input: UserInput) {
    login(input: $input) {
      _id
      username
      token
      loggedIn
    }
  }
`;

export default () => {
  return (
    <SessionForm mutation={LOGIN_USER} mutationName="login" />
  )
}