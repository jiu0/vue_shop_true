<template>
  <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>数据统计</el-breadcrumb-item>
            <el-breadcrumb-item>数据报表</el-breadcrumb-item> 
        </el-breadcrumb>
         <!-- 卡片 -->
        <el-card>
            <div id="main" style="width: 600px;height:400px;"></div>
        </el-card>    
  </div>
</template>

<script>
import * as echarts from 'echarts';
import _ from 'lodash';
export default {
  name: 'report',
  data(){
      return{
        // 合并的数据
        options:{
            title: {
              text: '用户来源'
            },
             tooltip: {
               trigger:'axis',
               axisPointer:{
                   type:'cross',
                   label:{
                       backgroundColor:'#e9eef3'
                   }
                }
             },
             grid:{
                left:'3%',
                right:'4%',
                bottom:'3%',
                containLabel:true,
             },
            xAxis: [
               {
                  boundaryGap:false
               }
            ],
            yAxis: [
               {
                  type:'value'
               }
            ],
         },
      }
  },
  async mounted(){
        // 基于准备好的dom，初始化echarts实例
        var myChart = echarts.init(document.getElementById('main'));
        const {data:res} = await this.$http.get('reports/type/1')
        if(res.meta.status !== 200 ){ return this.$message.error('获取报表数据失败')}
        this.$message.success(res.meta.msg)
        //合并两个对象
        const result = _.merge(res.data,this.options)
        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(result);
  },
  methods:{
  },
  created(){
  }
}
</script>
<style lang="less" scoped>
</style>