import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';

import gql from 'graphql-tag';

const CREATE_MESSAGE = gql`
  mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      success
      message {
        _id
        body
      }
    }
  }
`;

export default () => {
  const [body, setBody] = useState('');
  const [createMessage, { loading, error }] = useMutation(
    CREATE_MESSAGE,
    {
      variables: {
        input: { body }
      }
    }
  );

  return (
    <form onSubmit={e => {
      e.preventDefault();
      createMessage();
    }}>
      <label>
        <textarea placeholder="Write a message..." value={body} onChange={e => setBody(e.target.value)} />
      </label>
      <input type="submit" value="Submit" disabled={loading} />
      {error && <p>There was an error.</p>}
    </form>
  )
}