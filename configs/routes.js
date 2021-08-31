module.exports = (app) => {
  // eslint-disable-next-line global-require
  app.use('/api/v1', require('../api/v1/index'))
}
