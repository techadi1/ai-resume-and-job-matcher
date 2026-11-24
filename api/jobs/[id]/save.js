const handler = require('../../index');
module.exports = (req, res) => {
  if (!req.query) req.query = {};
  const id = req.query.id || (req.url.split('/jobs/')[1]?.split('/save')[0]);
  req.query.path = ['jobs', id, 'save'];
  return handler(req, res);
};
