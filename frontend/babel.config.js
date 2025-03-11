module.exports = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
      }],
      ['@babel/plugin-transform-private-methods', { loose: true }], // Explicitly set loose mode
      ['@babel/plugin-transform-class-properties', { loose: true }], // Explicitly set loose mode
      ['@babel/plugin-transform-private-property-in-object', { loose: true }], // Explicitly set loose mode
    ],
  };