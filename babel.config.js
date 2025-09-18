module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        browsers: [
          'Chrome >= 60',
          'Firefox >= 55',
          'Safari >= 12',
          'Edge >= 79'
        ]
      },
      modules: false
    }]
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread'
  ]
};
