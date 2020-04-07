import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AuthRoute from './components/util/AuthRoute';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <AuthRoute path="/login" component={Login} />
        <AuthRoute path="/signup" component={Signup} />
        <Route path="/" component={Chat} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
