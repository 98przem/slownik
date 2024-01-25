module.exports = {
    module: {
      rules: [
        {
          test: /\.json$/,
          use: 'json-loader',
          type: 'javascript/auto',
        },
      ],
    },
  };