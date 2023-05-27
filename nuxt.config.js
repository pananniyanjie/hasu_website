export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'Liella!星象馆 - 私を叶える物語。',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
    script:[
      // {src:'/scripts/clarity.js'}
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    { src: '~/assets/styles/index.scss', lang: 'scss' }
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '@/plugins/bootstrap-vue.js',
    '@/plugins/vue-resize.js',
    '@/plugins/vue-easytable.js',
    { src: "~/plugins/lottie-player.js", mode: "client" },
    { src:"~/plugins/vconsole", mode: "client"}
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    '@nuxtjs/proxy',
    // https://www.npmjs.com/package/@nuxtjs/markdownit
    '@nuxtjs/markdownit',
    // https://github.com/nuxt-community/universal-storage-module
    'cookie-universal-nuxt',
    // https://www.npmjs.com/package/nuxt-clipboard
    'nuxt-clipboard',
    '~/modules/clarity/module.js',
    '~/modules/gtag/module.js'
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {
    baseURL:"/",
    proxy: true,
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      name: '星象馆',
      lang: 'zh'
    },
    icon: {
      source:'./static/icon.png'
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    babel:{
      plugins:[
        ["@babel/plugin-proposal-private-property-in-object", { "loose": true }]
      ]
    },
    // friendlyErrors: false,
    // vendor: ['~/assets/script/clarity.js'],
  },

  generate: {
    subFolders: false,
    routes: ['/index']
  },

  router: {
    middleware: ['exit','analytics','stats']
  },

  markdownit: {
    html: true,
    linkify: true,
    typographer: true,
    runtime: true // Support `$md()`
  },
  
  clipboard: {
      autoSetContainer: true
  },

  env: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000'
  },
  proxy: {
    '/api/': {
      target: 'https://liella.tv/api', // 请求得对方地址
      changeOrigin: true,
      pathRewrite: {
        '^/api/': ''
      }
    }
  }
}
