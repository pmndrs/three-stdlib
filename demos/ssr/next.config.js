const withTM = require('next-transpile-modules')(['three'])

module.exports = withTM({
  future: { webpack5: true },
})
