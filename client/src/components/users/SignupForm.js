import React from 'react';

import gql from 'graphql-tag';
import SessionForm from './SessionForm';

const SIGNUP_USER = gql`
  mutation SignupUser($input: UserInput) {
    signup(input: $input) {
      _id
      username
      token
      loggedIn
    }
  }
`;

export default () => {
  return (
    <SessionForm mutation={SIGNUP_USER} mutationName="signup" />
  )
}