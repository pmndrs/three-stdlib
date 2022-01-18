const path = require('path')

module.exports = {
  stories: ['./stories/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-controls', '@storybook/addon-storysource'],
  core: {
    builder: 'webpack5',
  },
  staticDirs: ['./public'],
}
