const handler = require('../../index');
module.exports = (req, res) => {
  if (!req.query) req.query = {};
  const id = req.query.id || (req.url.split('/resumes/')[1]?.split('/analysis')[0]);
  req.query.path = ['resumes', id, 'analysis'];
  return handler(req, res);
};
