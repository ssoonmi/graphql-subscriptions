import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { IS_LOGGED_IN } from '../../graphql/users';
import { Redirect, Route } from 'react-router-dom';

export default ({ component: Component, path, exact, redirectTo }) => {
  const { data, loading, error } = useQuery(IS_LOGGED_IN);

  if (loading || error) return null;

  if (!redirectTo) redirectTo = "/"

  if (data && !data.isLoggedIn) return <Route path={path} exact={exact} render={(props) => <Component {...props} />} />;
  return <Redirect to={redirectTo} />
}