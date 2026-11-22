const handler = require('../index');
module.exports = (req, res) => {
  if (!req.query) req.query = {};
  const sub = req.query.path ? (Array.isArray(req.query.path) ? req.query.path : [req.query.path]) : [];
  req.query.path = ['resumes', ...sub];
  return handler(req, res);
};
