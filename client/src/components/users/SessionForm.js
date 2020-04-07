import React, { useState } from 'react';
import { useMutation } from '@apollo/react-hooks';

export default ({ submitButtonText, mutation, mutationName }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitHandler, { loading, error }] = useMutation(
    mutation,
    {
      variables: {
        input: { username, password }
      },
      update(cache, { data }) {
        cache.writeData({ data: { isLoggedIn: true } });
        localStorage.setItem('token', data[mutationName].token);
      }
    }
  );
  
  return (
    <form onSubmit={e => {
      e.preventDefault();
      submitHandler();
    }} >
      <label>
        Username:
        <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
      </label>
      <label>
        Password:
        <input type="text" value={password} onChange={e => setPassword(e.target.value)} />
      </label>
      <input type="submit" value={submitButtonText} disabled={loading} />
      {error && <p>There was an error...</p>}
    </form>
  );
}