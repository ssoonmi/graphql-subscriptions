const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secretOrKey = require('../config/keys').secretOrKey;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    min: 8,
    max: 32,
    required: true
  }
});

UserSchema.statics.login = async function(username, password) {
  const User = this;
  const user = await User.findOne({ username });

  if (!user) return null;
  if (!bcrypt.compareSync(password, user.password)) return null;

  const token = jwt.sign({
    _id: user._id,
    username: user.username
  }, secretOrKey);

  user.token = 'Bearer ' + token;
  user.loggedIn = true;
  return user;
};

UserSchema.statics.signup = async function(username, password) {
  const User = this;
  const hashedPassword = bcrypt.hashSync(password);
  const user = new User({ username, password: hashedPassword });
  await user.save();

  const token = jwt.sign({
    _id: user._id,
    username: user.username
  }, secretOrKey);

  user.token = 'Bearer ' + token;
  user.loggedIn = true;
  return user;
};

module.exports = mongoose.model('User', UserSchema);