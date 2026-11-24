const handler = require('../../index');
module.exports = (req, res) => {
  if (!req.query) req.query = {};
  const id = req.query.id || (req.url.split('/resumes/')[1]?.split('/status')[0]);
  req.query.path = ['resumes', id, 'status'];
  return handler(req, res);
};
