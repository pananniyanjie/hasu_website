const { resolve } = require('path')
export default function (moduleOptions){
    this.addPlugin({
        src: resolve(__dirname, 'plugin.js'),
        fileName: 'gtag.js',
        ssr: false,
    })
}