const express = require('express');
const mongoose = require('mongoose');
require('./models');
const graphqlHTTP = require('express-graphql');
const { graphqlLogger, authenticate, verifyUser } = require('./middlewares');
const { schema, resolvers } = require('./schema');

const { execute, subscribe } = require('graphql');
const { createServer } = require('http');
const { SubscriptionServer } = require('subscriptions-transport-ws');

const loggedInUsers = {};
const { PubSub } = require('./subscriptions');
const pubsub = new PubSub();

const db = require('./config/keys').mongoURI;
const PORT = process.env.PORT || 5000;
let subscriptionsEndpoint = `ws://localhost:${PORT}/subscriptions`;

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((e) => console.log(e));

const app = express();
app.use(require('morgan')('dev'));

const bodyParser = require('body-parser');
app.use(bodyParser.json());

if (process.env.NODE_ENV !== 'production') {
  const cors = require('cors');
  const expressPlayground = require('graphql-playground-middleware-express').default;
  app.use(cors({ origin: 'http://localhost:3000' }));
  app.get('/playground', expressPlayground({ endpoint: '/graphql' }));
}

app.use(
  '/graphql',
  graphqlLogger(false),
  authenticate,
  (req, res, next) => {
    req.pubsub = pubsub;
    req.loggedInUsers = loggedInUsers;
    next();
  },
  graphqlHTTP({
    schema,
    rootValue: resolvers,
    subscriptionsEndpoint
  })
);

const webServer = createServer(app);

webServer.listen(PORT, () => {
  console.log('Server is listening on port ' + PORT);

  new SubscriptionServer({
    execute,
    subscribe,
    schema,
    rootValue: resolvers,
    onConnect: (connectionParams, socket) => {
      console.log('WS Connected!');
      return verifyUser(connectionParams.authorization)
        .then((user) => {
          const context = { pubsub };
          if (user) {
            context.user = user;
            pubsub.addUserToSocket(user, socket);
            // if (loggedInUsers[user._id]) loggedInUsers[user._id].count++;
            // else {
            //   pubsub.publish(USER_LOGGED_EVENT, { userLoggedEvent: { user, loggedIn: true } });
            //   loggedInUsers[user._id] = {
            //     count: 1,
            //     user
            //   }
            // }
            // socket.userId = user._id;
            // console.log({ loggedInUsers: pubsub.loggedInUsers });
          }
          return context; 
        });
    },
    onOperation: async (message, params, socket) => {
      const token = message.payload.authToken;
      if (!socket.userId && token) {
        return verifyUser(token)
          .then(user => {
            if (user) {
              params.context.user = user;
              pubsub.addUserToSocket(user, socket);
            }
            return params;
          });
      } else if (socket.userId && !token) {
        pubsub.removeUserFromSocket(socket);
      }
      return params;
    },
    onDisconnect: (socket, context) => {
      // if (socket.userId && loggedInUsers[socket.userId]) {
      //   loggedInUsers[socket.userId].count--;
      //   if (loggedInUsers[socket.userId].count < 1) {
      //     pubsub.publish(USER_LOGGED_EVENT, { userLoggedEvent: { user: loggedInUsers[socket.userId].user, loggedIn: false } });
      //     delete loggedInUsers[socket.userId];
      //   }
      // }
      pubsub.removeUserFromSocket(socket);
      // console.log({ loggedInUsers: pubsub.loggedInUsers })
      console.log("WS Disconnected!");
    }
  }, {
    server: webServer,
    path: '/subscriptions',
  });
})