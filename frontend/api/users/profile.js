const handler = require('../index');
module.exports = (req, res) => {
  if (!req.query) req.query = {};
  req.query.path = ['users', 'profile'];
  return handler(req, res);
};
