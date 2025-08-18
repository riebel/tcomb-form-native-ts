module.exports = (api) => {
  // Cache the configuration based on the environment
  api.cache.using(() => process.env.NODE_ENV);

  const isTestEnv = api.env('test');
  const isDevEnv = api.env('development');
  const isProdEnv = api.env('production');

  const presets = [
    ['module:@react-native/babel-preset', {
      // Enable Hermes for better performance (optional)
      hermes: true,
      // Enable TypeScript support
      typescript: true,
    }],
    ['@babel/preset-env', {
      // Use the minimal target that supports ES Modules
      targets: isTestEnv 
        ? { node: 'current' } 
        : { esmodules: true },
      // Use the minimal syntax necessary for the target browsers
      bugfixes: true,
      // Use the minimal polyfills needed for the target browsers
      useBuiltIns: 'usage',
      // Use the core-js 3 version that matches the React Native version
      corejs: '3.25',
      // Don't transform modules for test environment to make it faster
      modules: isTestEnv ? 'commonjs' : false,
      // Enable debug logging in development
      debug: isDevEnv,
    }],
    ['@babel/preset-react', {
      // Use the new JSX transform (automatically imports React)
      runtime: 'automatic',
      // Use the React Native JSX runtime
      importSource: 'react',
      // Enable development helpers in development
      development: isDevEnv,
    }],
    '@babel/preset-typescript',
    '@babel/preset-flow',
  ];

  const plugins = [
    // Enable class properties and private methods
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    // Add any additional plugins here
    ['@babel/plugin-transform-runtime', {
      regenerator: true,
    }],
    // Add Flow and module transformation plugins
    '@babel/plugin-transform-flow-strip-types',
    '@babel/plugin-transform-modules-commonjs',
    ['@babel/plugin-proposal-private-methods', { loose: true }],
    ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
    
    // Better module resolution
    ['module-resolver', {
      root: ['./src'],
      extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
      alias: {
        '^@/(.*)$': './src/\\1',
      },
    }],

    // Optimizations for production
    isProdEnv && [
      'transform-react-remove-prop-types',
      { removeImport: true },
    ],
    
    // Development only plugins
    isDevEnv && 'react-refresh/babel',
  ].filter(Boolean);

  return {
    presets,
    plugins,
    // Only enable source maps in development
    sourceMaps: isDevEnv,
    // Retain line numbers for better error messages
    retainLines: true,
  };
};
