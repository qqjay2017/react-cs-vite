{
  configFile: false,
  mode: 'development',
  root: 'D:\\pro-huang\\react-cs-vite\\dist',
  server: { port: 1337, fs: { allow: [Array] } },
  publicDir: 'D:\\pro-huang\\rcv-template\\public',
  define: {},
  plugins: [
    {
      name: 'vite-plugin-pages',
      enforce: 'pre',
      configResolved: [AsyncFunction: configResolved],
      api: [Object],
      configureServer: [Function: configureServer],
      resolveId: [Function: resolveId],
      load: [AsyncFunction: load]
    },
    [ [Object], [Object] ]
  ]
}defaultConfig

{
  configFile: false,
  mode: 'development',
  root: 'D:\\pro-huang\\react-cs-vite\\dist',
  server: { port: 1337, fs: { allow: [Array] } },
  publicDir: 'D:\\pro-huang\\rcv-template\\public',
  define: {
    OAUTH2_URL: 'https://test-scm.kxgcc.com:30195/auth',
    PRI_K: 'YMSL_JSRSASIGN_PRI_KEY_UNQIC',
    REACT_APP_ENV: '1214',
    envDefine: 'bbass'
  },
  plugins: [
    {
      name: 'vite-plugin-pages',
      enforce: 'pre',
      configResolved: [AsyncFunction: configResolved],
      api: [Object],
      configureServer: [Function: configureServer],
      resolveId: [Function: resolveId],
      load: [AsyncFunction: load]
    },
    [ [Object], [Object] ]
  ],
  base: '/m/scm'
} 