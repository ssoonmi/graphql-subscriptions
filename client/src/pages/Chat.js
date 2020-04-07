import React from 'react';
import LoggedInUsers from '../components/chat/LoggedInUsers';
import MessageIndex from '../components/chat/MessageIndex';
import CreateMessageForm from '../components/chat/CreateMessageForm';

export default () => {
  return (
    <>
      <LoggedInUsers />
      <MessageIndex />
      <CreateMessageForm />
    </>
  );
}