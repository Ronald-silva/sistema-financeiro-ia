const webpack = require('webpack');

module.exports = function override(config) {
  config.resolve.fallback = {
    ...config.resolve.fallback,
    stream: require.resolve('stream-browserify'),
    os: require.resolve('os-browserify/browser'),
    process: require.resolve('process/browser'),  // Adiciona o polyfill para 'process'
    buffer: require.resolve('buffer/'),  // Adiciona o polyfill para 'buffer'
  };
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ];
  return config;
};
