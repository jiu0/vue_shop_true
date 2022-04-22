// 更改 开发环境 和生产环境的 main.js 的项目入口
module.exports = {
   outputDir: 'vue_shop_true', 
   productionSourceMap:false,  // 打包去掉.map文件
   publicPath: process.env.NODE_ENV === 'production' ? './' : '', 
   chainWebpack:config =>{
    // 发布模式 
    config.when(process.env.NODE_ENV==='production',config=>{
        config.entry('app').clear().add('./src/main-prod.js')  // 更改项目的入口
        config.set('externals',{    // 使用 externals  externals里面的包 不会打包到 js 文件里 打开页面时 用到的 Js 文件通过cdn 的方式 引入到项目中 减小项目的体积  
          vue:'Vue',
          'vue-router':'VueRouter',
          axios:'axios',
          lodash:'_',
          echarts:'echarts',
          nprogress:'NProgress',
          'vue-quill-editor':'VueQuillEditor'
        })
        // 在不同的环境设置不同的页面标题
        config.plugin('html').tap(args=>{
            args[0].isProd = true;
            return args;
        })
    })
    // 开发模式
    config.when(process.env.NODE_ENV==='development',config=>{
        config.entry('app').clear().add('./src/main-dev.js')
        // 在不同的环境设置不同的页面标题
        config.plugin('html').tap(args=>{
            args[0].isProd = false;
            return args;
        })
    }) 
   }
}