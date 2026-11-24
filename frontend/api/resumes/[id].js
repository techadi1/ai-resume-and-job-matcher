const handler = require('../index');
module.exports = (req, res) => {
  if (!req.query) req.query = {};
  const id = req.query.id || (req.url.split('?')[0].split('/').pop());
  req.query.path = ['resumes', id];
  return handler(req, res);
};
