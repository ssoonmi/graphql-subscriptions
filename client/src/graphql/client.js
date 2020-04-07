import { ApolloClient } from 'apollo-client';
import { ApolloLink, split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { onError } from "apollo-link-error";

import { typeDefs, resolvers } from './resolvers';
import { IS_LOGGED_IN, CURRENT_USER } from './users';
import gql from 'graphql-tag';

export default async function createClient() {
  const cache = new InMemoryCache({ dataIdFromObject: object => object._id });

  // Create an http link:
  const httpLink = new HttpLink({
    uri: 'http://localhost:5000/graphql'
  });

  // Create a WebSocket link:
  const wsLink = new WebSocketLink({
    uri: `ws://localhost:5000/subscriptions`,
    options: {
      reconnect: true,
      connectionParams: () => ({
        authorization: localStorage.getItem('token'),
      }),
    }
  });

  const subscriptionMiddleware = {
    applyMiddleware: async (payload, next) => {
      payload.authToken = localStorage.getItem('token')
      next()
    },
  }

  // add the middleware to the web socket link via the Subscription Transport client
  wsLink.subscriptionClient.use([subscriptionMiddleware])

  // using the ability to split links, you can send data to each link
  // depending on what kind of operation is being sent
  const serverLink = split(
    // split based on operation type
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink,
  );

  const authLink = setContext((_, data) => {
    if (!localStorage.getItem('token')) return { headers: data.headers }
    return {
      headers: {
        ...data.headers,
        authorization: localStorage.getItem('token')
      }
    };
  });

  const errorLink = onError(({ networkError, graphQLErrors }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path, extensions }) => {
        console.group("\x1b[31m%s\x1b[0m", "[GraphQL error] ", "Message: ", message);
        console.log("Location: ", locations);
        console.log("Path: ", path);
        console.log("Extensions: ", extensions)
        console.groupEnd();
      });
    }
    if (networkError) console.log("\x1b[31m%s\x1b[0m", "[Network error]:", networkError);
  });

  const client = new ApolloClient({
    cache,
    link: ApolloLink.from([authLink.concat(errorLink), serverLink]),
    typeDefs,
    resolvers
  });

  if (process.env.NODE_ENV !== 'production') {
    window.client = client;
    window.gql = gql;
  }

  client.onResetStore(() => {
    console.log('clearing cache');
    localStorage.clear();
  });

  if (localStorage.getItem('token')) {
    await client
      .query({ query: CURRENT_USER })
      .then(({ data }) => {
        if (!data || !data.me) client.resetStore();
      });
  }

  return client;
}