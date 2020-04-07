import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import { ApolloProvider } from "@apollo/react-hooks";

import createClient from './graphql/client';

createClient().then(client => {
  ReactDOM.render(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>,
    document.getElementById("root")
  );
}).catch(err => {
  // something wrong with initializing client
  ReactDOM.render(
    <h1>Error</h1>,
    document.getElementById("root")
  )
});