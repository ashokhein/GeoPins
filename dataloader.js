const DataLoader = require('dataloader');
const User = require('./models/User');
const _ = require('lodash');

const userLoader = new DataLoader(async userIds => {
  const users = await User.find({ _id: { $in: userIds } }).exec();
  const usersById = _.keyBy(users, "_id");
  return userIds.map(userId => usersById[userId]);
});

module.exports = userLoader;
