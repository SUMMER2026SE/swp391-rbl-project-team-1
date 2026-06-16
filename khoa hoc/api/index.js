let appPromise = import('../apps/api/dist/index.js').then(m => m.default);

module.exports = (req, res) => {
  appPromise.then(app => {
    app(req, res);
  }).catch(err => {
    res.status(500).send(err.message);
  });
};
