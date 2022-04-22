import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
//import './plugins/element.js'
//import 'element-ui/lib/theme-chalk/index.css';
import document from '@/common/webClick'


// 导入 NProgress 包对应的JS和CSS
import NProgress from 'nprogress'


// 导入全局样式表
import './assets/css/global.css'
import './assets/font/iconfont.css'

import VueQuillEditor from 'vue-quill-editor'

// 将富文本编辑器注册为全局组件
Vue.use(VueQuillEditor)

import TreeTable from 'vue-table-with-tree-grid'
Vue.component('tree-table', TreeTable)

import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'
// axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须 return config
  return config
})


// 在 response 拦截器中，隐藏进度条 NProgress.done()
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
}) 
Vue.prototype.$http = axios


// 全局时间过滤器
Vue.filter('dataFormat', function (originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  // yyyy-mm-dd hh:mm:ss
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
