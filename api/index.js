module.exports = async (req, res) => {
  const app = (await import('../apps/api/dist/index.js')).default;
  return app(req, res);
};
