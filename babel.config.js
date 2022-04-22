// 这是项目发布阶段要用到的babel 插件
const prodPlugins = []
if(process.env.NODE_ENV ==='production'){
  prodPlugins.push('transform-remove-console')
}
module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  'plugins':[
     // 发布产品时需要的插件
     ...prodPlugins,
     '@babel/plugin-syntax-dynamic-import'  // 路由濑加载需要的插件
  ]
}
