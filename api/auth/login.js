const handler = require('../index');
module.exports = (req, res) => {
  if (!req.query) req.query = {};
  if (!req.query.path) req.query.path = ['auth', 'login'];
  return handler(req, res);
};
