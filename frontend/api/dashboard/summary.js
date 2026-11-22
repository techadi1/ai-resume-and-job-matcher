const handler = require('../index');
module.exports = (req, res) => {
  if (!req.query) req.query = {};
  req.query.path = ['dashboard', 'summary'];
  return handler(req, res);
};
