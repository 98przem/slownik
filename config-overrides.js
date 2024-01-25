const path = require('path');

module.exports = function override(config, env) {
  // Add a rule to handle large JSON file using file-loader
  config.module.rules.push({
    test: /\.json$/,
    type: 'javascript/auto',
    loader: 'file-loader',
    options: {
      name: 'static/media/[name].[hash:8].[ext]',
    },
  });

  // Use the DefinePlugin to replace the JSON file import with its path
  config.plugins.forEach((plugin) => {
    if (plugin.definitions && plugin.definitions['process.env']) {
      plugin.definitions['process.env'] = {
        ...plugin.definitions['process.env'],
        LARGE_JSON_FILE_PATH: JSON.stringify(path.resolve(__dirname, 'src/wkt/fi-en-en-converted.json')),
      };
    }
  });

  return config;
};