const handler = require('../index');
module.exports = (req, res) => {
  if (!req.query) req.query = {};
  req.query.path = ['jobs', 'recommended'];
  return handler(req, res);
};
