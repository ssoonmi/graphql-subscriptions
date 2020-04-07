const MESSAGE_CREATED = 'MESSAGE_CREATED';
const USER_LOGGED_EVENT = 'USER_LOGGED_EVENT';

const { PubSub } = require('graphql-subscriptions');

class MyPubSub extends PubSub {
  constructor(...args) {
    super(...args);
    this.loggedInUsers = {};
  }

  getUsers() {
    return Object.values(this.loggedInUsers).map(user => user.user);
  }

  addUserToSocket(user, socket) {
    if (socket.userId === user._id) return;
    else if (socket.userId) {
      this.removeUserFromSocket(socket);
    }

    socket.userId = user._id;
    
    if (this.loggedInUsers[user._id]) this.loggedInUsers[user._id].count++;
    else {
      this.publish(USER_LOGGED_EVENT, { userLoggedEvent: { user, loggedIn: true } });
      this.loggedInUsers[user._id] = {
        count: 1,
        user
      }
    }
    return this.loggedInUsers;
  }

  removeUserFromSocket(socket) {
    if (socket.userId && this.loggedInUsers[socket.userId]) {
      this.loggedInUsers[socket.userId].count--;
      if (this.loggedInUsers[socket.userId].count < 1) {
        this.publish(USER_LOGGED_EVENT, { userLoggedEvent: { user: this.loggedInUsers[socket.userId].user, loggedIn: false } });
        delete this.loggedInUsers[socket.userId];
      }
    }
    return this.loggedInUsers;
  }
}


module.exports = {
  MESSAGE_CREATED,
  USER_LOGGED_EVENT,
  PubSub: MyPubSub
}