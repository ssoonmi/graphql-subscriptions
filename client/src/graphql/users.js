import gql from 'graphql-tag';

export const IS_LOGGED_IN = gql`
  query IsLoggedIn {
    isLoggedIn @client
  }
`;

export const CURRENT_USER = gql`
  query CurrentUser {
    me {
      _id
      username
    }
  }
`;